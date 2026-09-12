import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

function tokenFromRequest(req) {
    const authorization = req.get("authorization") || "";
    const [scheme, bearerToken] = authorization.split(" ");
    const cookieToken = req.headers.cookie
        ?.split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("nexora_client_token="))
        ?.split("=")[1];
    return scheme === "Bearer" ? bearerToken || cookieToken : cookieToken;
}

export function authenticateClient(req, res, next) {
    if (!env.jwtSecret) {
        return res
            .status(503)
            .json({
                success: false,
                message: "Authentication is not configured.",
            });
    }
    const token = tokenFromRequest(req);
    if (!token)
        return res
            .status(401)
            .json({ success: false, message: "Authentication required." });
    try {
        const payload = jwt.verify(token, env.jwtSecret);
        if (
            typeof payload !== "object" ||
            payload.role !== "client" ||
            !payload.sub ||
            !payload.companyId
        ) {
            return res
                .status(403)
                .json({ success: false, message: "Client access required." });
        }
        req.user = payload;
        next();
    } catch {
        return res
            .status(401)
            .json({ success: false, message: "Invalid or expired session." });
    }
}
