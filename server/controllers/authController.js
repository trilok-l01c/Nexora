import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isDatabaseReady } from "../config/database.js";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

export async function login(req, res, next) {
    if (!isDatabaseReady() || !env.jwtSecret) {
        return res
            .status(503)
            .json({
                success: false,
                message: "Authentication is temporarily unavailable.",
            });
    }

    try {
        const user = await User.findOne({ email: req.loginInput.email }).select(
            "+passwordHash",
        );
        const validPassword =
            user && user.active
                ? await bcrypt.compare(
                      req.loginInput.password,
                      user.passwordHash,
                  )
                : false;

        if (!validPassword) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "Invalid email or password.",
                });
        }

        const token = jwt.sign(
            { sub: user.id, role: user.role, email: user.email },
            env.jwtSecret,
            { expiresIn: env.jwtExpiresIn },
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                token,
                expiresIn: env.jwtExpiresIn,
                user: { email: user.email, role: user.role },
            },
        });
    } catch (error) {
        next(error);
    }
}
