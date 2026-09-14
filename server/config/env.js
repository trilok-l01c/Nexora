import "dotenv/config";

const required = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not configured`);
    }
    return value;
};

export const env = {
    port: Number(process.env.PORT || 4292),
    mongoUri: process.env.MONGODB_URI || "",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
    adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase() || "",
    adminPassword: process.env.ADMIN_PASSWORD || "",
    jwtSecret: process.env.JWT_SECRET || "",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",
    nodeEnv: process.env.NODE_ENV || "development",
};

export function assertProductionEnv() {
    if (env.nodeEnv !== "production") return;
    const missing = [
        "MONGODB_URI",
        "JWT_SECRET",
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD",
        "CORS_ORIGIN",
    ].filter((name) => !process.env[name]);
    if (missing.length > 0) {
        throw new Error(
            `Missing required production environment variables: ${missing.join(", ")}`,
        );
    }
    if ((process.env.JWT_SECRET || "").length < 32) {
        throw new Error("JWT_SECRET must be at least 32 characters in production.");
    }
    if ((process.env.CORS_ORIGIN || "").includes("localhost")) {
        throw new Error("CORS_ORIGIN must not use localhost in production.");
    }
}

export { required };
