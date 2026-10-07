import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { corsOrigins, env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import portfolioUploadRoutes from "./routes/portfolioUploadRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "http:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'", "data:"],
                objectSrc: ["'none'"],
                frameAncestors: ["'self'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }),
);
app.use(
    cors({
        // Do not use wildcard CORS with credentials. Requests with no Origin
        // (health checks and server-to-server calls) are intentionally allowed.
        origin(origin, callback) {
            if (!origin || corsOrigins.includes(origin.replace(/\/+$/, ""))) {
                return callback(null, true);
            }
            return callback(new Error("Origin is not allowed by CORS."));
        },
        methods: ["GET", "POST", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }),
);
app.use(express.json({ limit: "20kb" }));

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many contact requests. Please try again later.",
    },
});

// Brute-force protection for credential endpoints. Each credential surface
// gets its OWN limiter instance: sharing one between `/api/auth` and
// `/api/admin/login` let ordinary signup traffic exhaust the admin budget and
// lock staff out of `/admin`.
//
// Two independent rules are needed, because either alone leaves a hole:
//
// 1. `skipSuccessfulRequests` charges only failures, so a rejected payload
//    (a validation 400) does not consume the budget — previously three mistyped
//    signups locked the user out of both surfaces for 15 minutes.
// 2. `skip` is still required for `/session` and `/logout`. Those answer 503
//    whenever the database is down, and a 503 counts as a failure, so during an
//    outage the session check that runs on every page load drained the whole
//    budget and every visitor saw "Too many login attempts".
//
// `skip` matches on `originalUrl` because `req.path` is rewritten by the mount
// point: under `app.use("/api/auth", ...)` it is "/session", but under
// `app.use("/api/admin/login", ...)` it is "/", which is why the original
// path-based condition silently stopped working when it was shared.
function credentialLimiter(message, exemptPaths = []) {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 5,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        skipSuccessfulRequests: true,
        skip: (req) =>
            exemptPaths.includes(req.originalUrl.split("?")[0]),
        message: {
            success: false,
            message,
        },
    });
}

const clientLoginLimiter = credentialLimiter(
    "Too many login attempts. Please try again later.",
    ["/api/auth/session", "/api/auth/logout"],
);
const adminLoginLimiter = credentialLimiter(
    "Too many admin login attempts. Please try again later.",
    ["/api/admin/logout"],
);

// General write limiter for authenticated admin/client mutation routes.
const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please slow down.",
    },
});

// Lightweight request logger (no external dependency).
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const ms = Date.now() - start;
        console.log(
            `${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`,
        );
    });
    next();
});

app.get("/api", (req, res) => {
    res.json({ success: true, message: "Nexora API is running." });
});

app.get("/api/health", async (req, res) => {
    const { isDatabaseReady } = await import("./config/database.js");
    const databaseReady = isDatabaseReady();
    res.json({
        success: true,
        status: databaseReady ? "ok" : "degraded",
        database: databaseReady ? "connected" : "disconnected",
    });
});

app.use("/api/home", homeRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/auth", clientLoginLimiter, authRoutes);
app.use("/api/admin/login", adminLoginLimiter);
// The portfolio upload route MUST be mounted before `/api/admin`. Both paths
// start with `/api/admin`, so mounting it afterwards let the request fall
// through the `/api/admin` router first: `authenticateAdmin` ran twice and
// `writeLimiter` charged the request twice, halving the admin write budget
// for uploads specifically.
app.use("/api/admin/portfolio/upload", writeLimiter, portfolioUploadRoutes);
app.use("/api/admin", writeLimiter, adminRoutes);
app.use("/api/contact", contactLimiter, contactRoutes);
app.use("/api/client", writeLimiter, clientRoutes);
app.use("/api/projects", writeLimiter, projectRoutes);

// Local development uploads remain available at /uploads. Production uses
// S3-compatible object storage and stores public object URLs in MongoDB.
if (env.storageDriver === "local") {
    app.use("/uploads", express.static(path.join(__dirname, "storage", "uploads")));
}

app.use(notFound);
app.use(errorHandler);

export default app;
