import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
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
        origin: env.corsOrigin.split(",").map((origin) => origin.trim()),
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

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    // Brute-force protection only applies to credential endpoints. The
    // session check runs on every page load and logout must always succeed,
    // so both are exempt — otherwise five ordinary page views (or a couple
    // of logins) would leave a signed-in user unable to check or end their
    // own session for 15 minutes.
    skip: (req) => req.path === "/session" || req.path === "/logout",
    message: {
        success: false,
        message: "Too many login attempts. Please try again later.",
    },
});

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
app.use("/api/auth", loginLimiter, authRoutes);
app.use("/api/admin/login", loginLimiter);
app.use("/api/admin", writeLimiter, adminRoutes);
app.use("/api/contact", contactLimiter, contactRoutes);
app.use("/api/client", writeLimiter, clientRoutes);
app.use("/api/projects", writeLimiter, projectRoutes);
app.use("/api/admin/portfolio/upload", writeLimiter, portfolioUploadRoutes);

// Serve uploaded portfolio images statically.
app.use("/uploads", express.static(path.join(__dirname, "storage", "uploads")));

app.use(notFound);
app.use(errorHandler);

export default app;
