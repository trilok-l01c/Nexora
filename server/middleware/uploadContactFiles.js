import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { env } from "../config/env.js";

const allowedTypes = new Map([
    ["application/pdf", ".pdf"],
    ["application/msword", ".doc"],
    [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".docx",
    ],
    ["application/vnd.ms-excel", ".xls"],
    [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".xlsx",
    ],
    ["application/vnd.ms-powerpoint", ".ppt"],
    [
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".pptx",
    ],
    ["text/plain", ".txt"],
    ["image/jpeg", ".jpg"],
    ["image/png", ".png"],
    ["image/webp", ".webp"],
]);

const uploadDirectory = path.resolve(process.cwd(), env.uploadDir);
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadDirectory,
    filename: (_, file, callback) => {
        const extension = allowedTypes.get(file.mimetype);
        callback(null, `${crypto.randomUUID()}${extension}`);
    },
});

function fileFilter(_, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    const expectedExtension = allowedTypes.get(file.mimetype);
    if (!expectedExtension || extension !== expectedExtension) {
        return callback(
            new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname),
        );
    }
    callback(null, true);
}

const parseContactFiles = multer({
    storage,
    fileFilter,
    limits: {
        files: 5,
        fileSize: 10 * 1024 * 1024,
        fields: 10,
        fieldSize: 20 * 1024,
    },
}).array("attachments", 5);

export function uploadContactFiles(req, res, next) {
    parseContactFiles(req, res, (error) => {
        if (!error) {
            return next();
        }
        return Promise.all(
            (req.files || []).map((file) =>
                fs.promises.unlink(file.path).catch(() => undefined),
            ),
        ).then(() => next(error));
    });
}

export { uploadDirectory };
