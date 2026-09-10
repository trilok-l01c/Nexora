import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: env.corsOrigin.split(",").map((origin) => origin.trim()),
        methods: ["GET", "POST", "PATCH"],
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
    message: {
        success: false,
        message: "Too many login attempts. Please try again later.",
    },
});

app.get("/api", (req, res) => {
    res.json({ success: true, message: "Nexora API is running." });
});

app.get("/api/health", (req, res) => {
    res.json({ success: true, status: "ok" });
});

app.use("/api/auth", loginLimiter, authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactLimiter, contactRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
