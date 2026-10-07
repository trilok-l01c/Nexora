import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localUploadDir = path.join(__dirname, "..", "storage", "uploads");

let s3Client;

function extensionFor(file) {
    const extension = path.extname(file.originalname || "").toLowerCase();
    return [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(extension)
        ? extension
        : ".bin";
}

function objectName(file) {
    return `${Date.now()}-${randomUUID()}${extensionFor(file)}`;
}

function getS3Client() {
    if (!s3Client) {
        s3Client = new S3Client({
            region: env.s3Region,
            ...(env.s3Endpoint ? { endpoint: env.s3Endpoint, forcePathStyle: true } : {}),
            credentials: {
                accessKeyId: env.s3AccessKeyId,
                secretAccessKey: env.s3SecretAccessKey,
            },
        });
    }
    return s3Client;
}

/** Store an admin-uploaded image and return the URL persisted in MongoDB. */
export async function storeUpload(file) {
    const name = objectName(file);
    if (env.storageDriver === "local") {
        await mkdir(localUploadDir, { recursive: true });
        await writeFile(path.join(localUploadDir, name), file.buffer);
        return `/uploads/${name}`;
    }

    if (env.storageDriver !== "s3") {
        throw new Error(`Unsupported STORAGE_DRIVER: ${env.storageDriver}`);
    }

    const key = `uploads/${name}`;
    await getS3Client().send(
        new PutObjectCommand({
            Bucket: env.s3Bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            CacheControl: "public, max-age=31536000, immutable",
        }),
    );
    return `${env.s3PublicUrl}/${key}`;
}
