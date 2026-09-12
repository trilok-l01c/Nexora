import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isDatabaseReady } from "../config/database.js";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Company } from "../models/Company.js";

function serializeAuthCookie(name, value, maxAge) {
    const secure = env.nodeEnv === "production" ? "; Secure" : "";
    return `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${secure}`;
}

export async function login(req, res, next, requiredRole) {
    if (!isDatabaseReady() || !env.jwtSecret) {
        return res.status(503).json({
            success: false,
            message: "Authentication is temporarily unavailable.",
        });
    }

    try {
        const user = await User.findOne({ email: req.loginInput.email }).select(
            "+passwordHash",
        );
        const validPassword =
            user && user.active && (!requiredRole || user.role === requiredRole)
                ? await bcrypt.compare(
                      req.loginInput.password,
                      user.passwordHash,
                  )
                : false;

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const token = jwt.sign(
            {
                sub: user.id,
                role: user.role,
                email: user.email,
                companyId: user.companyId?.toString(),
            },
            env.jwtSecret,
            { expiresIn: env.jwtExpiresIn },
        );

        const cookieName =
            user.role === "admin"
                ? "nexora_admin_token"
                : "nexora_client_token";
        res.setHeader(
            "Set-Cookie",
            serializeAuthCookie(cookieName, token, 2 * 60 * 60),
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                expiresIn: env.jwtExpiresIn,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    companyId: user.companyId,
                },
            },
        });
    } catch (error) {
        next(error);
    }
}

export function logout(req, res) {
    res.setHeader("Set-Cookie", [
        serializeAuthCookie("nexora_admin_token", "", 0),
        serializeAuthCookie("nexora_client_token", "", 0),
    ]);
    return res
        .status(200)
        .json({ success: true, message: "Logout successful." });
}

export function loginAdmin(req, res, next) {
    return login(req, res, next, "admin");
}

export function loginClient(req, res, next) {
    return login(req, res, next, "client");
}

function companySlug(name) {
    return (
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "company"
    );
}

export async function signupClient(req, res, next) {
    if (!isDatabaseReady() || !env.jwtSecret) {
        return res.status(503).json({
            success: false,
            message: "Account creation is temporarily unavailable.",
        });
    }

    try {
        const existingUser = await User.exists({
            email: req.signupInput.email,
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists.",
            });
        }

        let company = await Company.findOne({
            name: new RegExp(
                `^${req.signupInput.company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                "i",
            ),
        });
        if (!company) {
            const baseSlug = companySlug(req.signupInput.company);
            company = await Company.create({
                name: req.signupInput.company,
                slug: `${baseSlug}-${Date.now().toString(36)}`,
            });
        }

        const passwordHash = await bcrypt.hash(req.signupInput.password, 12);
        const user = await User.create({
            name: req.signupInput.name,
            email: req.signupInput.email,
            passwordHash,
            companyId: company._id,
            role: "client",
        });

        const token = jwt.sign(
            {
                sub: user.id,
                role: "client",
                email: user.email,
                companyId: company.id,
            },
            env.jwtSecret,
            { expiresIn: env.jwtExpiresIn },
        );
        res.setHeader(
            "Set-Cookie",
            serializeAuthCookie("nexora_client_token", token, 2 * 60 * 60),
        );
        return res.status(201).json({
            success: true,
            message: "Account created.",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: "client",
                    companyId: company.id,
                },
            },
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res
                .status(409)
                .json({
                    success: false,
                    message:
                        "An account or company with these details already exists.",
                });
        }
        next(error);
    }
}
