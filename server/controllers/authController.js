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
            user &&
            user.active &&
            (!requiredRole ||
                (Array.isArray(requiredRole)
                    ? requiredRole.includes(user.role)
                    : user.role === requiredRole))
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
            user.role === "client"
                ? "nexora_client_token"
                : "nexora_admin_token";
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

function sessionFromRequest(req) {
    const cookieHeader = req.headers.cookie || "";
    const cookies = cookieHeader.split(";").map((part) => part.trim());
    for (const name of ["nexora_client_token", "nexora_admin_token"]) {
        const match = cookies
            .find((part) => part.startsWith(`${name}=`))
            ?.split("=")[1];
        if (!match) continue;
        try {
            const payload = jwt.verify(
                decodeURIComponent(match),
                env.jwtSecret,
            );
            if (
                typeof payload === "object" &&
                payload &&
                typeof payload.sub === "string" &&
                typeof payload.role === "string"
            ) {
                return {
                    id: payload.sub,
                    email: payload.email,
                    role: payload.role,
                    companyId: payload.companyId,
                };
            }
        } catch {
            // Expired/invalid token: treated as signed out below.
        }
    }
    return null;
}

// A signature check alone is not enough to report "signed in": a token issued
// before the account was deleted or deactivated stays cryptographically valid
// until it expires, so the site kept rendering the signed-in navigation for a
// user who could no longer authenticate. Confirm the account still exists and
// is active, and treat anything else as signed out. A database that cannot be
// reached is reported as signed out rather than throwing, because a temporary
// outage must not look like a valid session.
export async function getSession(req, res) {
    // Same connection guard as every other data handler: without it the lookup
    // below buffered for 10 seconds before timing out, and this endpoint runs on
    // every page load for every visitor.
    if (!isDatabaseReady() || !env.jwtSecret) {
        return res.status(503).json({
            success: false,
            message: "Authentication is temporarily unavailable.",
        });
    }
    const session = sessionFromRequest(req);
    if (!session) {
        return res.status(200).json({
            success: true,
            data: { authenticated: false, user: null },
        });
    }
    try {
        const user = await User.findById(session.id)
            .select("email role companyId active")
            .lean();
        if (!user || !user.active) {
            return res.status(200).json({
                success: true,
                data: { authenticated: false, user: null },
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                authenticated: true,
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    companyId: user.companyId?.toString(),
                },
            },
        });
    } catch {
        return res.status(200).json({
            success: true,
            data: { authenticated: false, user: null },
        });
    }
}

export function loginAdmin(req, res, next) {
    return login(req, res, next, ["admin", "staff"]);
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
            return res.status(409).json({
                success: false,
                message:
                    "An account or company with these details already exists.",
            });
        }
        next(error);
    }
}
