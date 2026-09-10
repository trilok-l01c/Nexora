import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function authenticateAdmin(req, res, next) {
    if (!env.jwtSecret) {
        return res.status(503).json({
            success: false,
            message: "Authentication is not configured.",
        });
    }

    const authorization = req.get("authorization") || "";
    const [scheme, bearerToken] = authorization.split(" ");
    const cookieToken = req.headers.cookie
        ?.split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("nexora_admin_token="))
        ?.split("=")[1];
    const token =
        scheme === "Bearer" ? bearerToken || cookieToken : cookieToken;
    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: "Authentication required." });
    }

    try {
        const payload = jwt.verify(token, env.jwtSecret);
        if (typeof payload !== "object" || payload.role !== "admin") {
            return res
                .status(403)
                .json({ success: false, message: "Admin access required." });
        }
        req.user = payload;
        next();
    } catch {
        return res
            .status(401)
            .json({ success: false, message: "Invalid or expired token." });
    }
}
