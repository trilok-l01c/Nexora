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
};

export { required };
