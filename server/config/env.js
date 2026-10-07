import "dotenv/config";

export const env = {
    port: Number(process.env.PORT || 4292),
    mongoUri: process.env.MONGODB_URI || "",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
    adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase() || "",
    adminPassword: process.env.ADMIN_PASSWORD || "",
    jwtSecret: process.env.JWT_SECRET || "",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",
    nodeEnv: process.env.NODE_ENV || "development",
    cookieSameSite: (process.env.COOKIE_SAME_SITE || "lax").toLowerCase(),
    cookieDomain: process.env.COOKIE_DOMAIN?.trim() || "",
    storageDriver: (process.env.STORAGE_DRIVER || "local").toLowerCase(),
    s3Endpoint: process.env.S3_ENDPOINT?.trim() || "",
    s3Region: process.env.S3_REGION?.trim() || "us-east-1",
    s3Bucket: process.env.S3_BUCKET?.trim() || "",
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    s3PublicUrl: process.env.S3_PUBLIC_URL?.trim().replace(/\/+$/, "") || "",
};

export const corsOrigins = env.corsOrigin
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

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
    if (
        corsOrigins.length === 0 ||
        corsOrigins.some(
            (origin) =>
                origin === "*" ||
                !/^https:\/\/[^/]+$/i.test(origin) ||
                origin.includes("localhost"),
        )
    ) {
        throw new Error(
            "CORS_ORIGIN must contain one or more explicit HTTPS origins and no wildcards in production.",
        );
    }
    if (!["lax", "strict", "none"].includes(env.cookieSameSite)) {
        throw new Error("COOKIE_SAME_SITE must be lax, strict, or none.");
    }
    if (env.cookieSameSite === "none" && env.nodeEnv === "production") {
        // SameSite=None is secure only over HTTPS; cookies enforce Secure below.
        console.warn("COOKIE_SAME_SITE=none enables cross-site credentialed cookies.");
    }
    if (env.storageDriver !== "s3") {
        throw new Error(
            "STORAGE_DRIVER must be s3 in production; local filesystem storage is not durable on typical container hosts.",
        );
    }
    const missingStorage = [
        ["S3_BUCKET", env.s3Bucket],
        ["S3_ACCESS_KEY_ID", env.s3AccessKeyId],
        ["S3_SECRET_ACCESS_KEY", env.s3SecretAccessKey],
        ["S3_PUBLIC_URL", env.s3PublicUrl],
    ]
        .filter(([, value]) => !value)
        .map(([name]) => name);
    if (missingStorage.length > 0) {
        throw new Error(
            `Missing required S3 storage environment variables: ${missingStorage.join(", ")}`,
        );
    }
}
