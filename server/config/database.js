import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
    if (!env.mongoUri) {
        console.warn(
            "MONGODB_URI is not configured; contact submissions will be unavailable.",
        );
        return false;
    }

    try {
        await mongoose.connect(env.mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("MongoDB connected");
        return true;
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        return false;
    }
}

export function isDatabaseReady() {
    return mongoose.connection.readyState === 1;
}
