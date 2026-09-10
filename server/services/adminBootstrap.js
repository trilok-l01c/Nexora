import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

export async function ensureAdminUser() {
    if (!env.adminEmail || !env.adminPassword) {
        console.warn(
            "ADMIN_EMAIL or ADMIN_PASSWORD is not configured; admin login is unavailable.",
        );
        return false;
    }

    const existingUser = await User.findOne({ email: env.adminEmail });
    if (existingUser) {
        return true;
    }

    const passwordHash = await bcrypt.hash(env.adminPassword, 12);
    await User.create({ email: env.adminEmail, passwordHash, role: "admin" });
    console.log(`Admin account initialized for ${env.adminEmail}`);
    return true;
}
