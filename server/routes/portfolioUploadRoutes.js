import { Router } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authenticateAdmin } from "../middleware/authenticateAdmin.js";

// Note: multer is dynamically imported in the route handler to keep the
// dependency optional for environments that don't need file uploads.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "..", "storage", "uploads");

const ALLOWED_MIMES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const router = Router();

router.post("/", authenticateAdmin, async (req, res) => {
    try {
        const multer = (await import("multer")).default;

        const storage = multer.diskStorage({
            destination: UPLOAD_DIR,
            filename: (_req, file, cb) => {
                const ext = path.extname(file.originalname).toLowerCase();
                const unique = `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 10)}`;
                cb(null, `${unique}${ext}`);
            },
        });

        const upload = multer({
            storage,
            limits: { fileSize: MAX_FILE_SIZE },
            fileFilter: (_req, file, cb) => {
                if (ALLOWED_MIMES.has(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed."));
                }
            },
        }).single("image");

        upload(req, res, (err) => {
            if (err) {
                const message =
                    err.code === "LIMIT_FILE_SIZE"
                        ? "Image must be 5 MB or smaller."
                        : err.message || "Upload failed.";
                return res.status(400).json({ success: false, message });
            }
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No image file provided.",
                });
            }
            const imageUrl = `/uploads/${req.file.filename}`;
            return res.status(201).json({
                success: true,
                data: { imageUrl },
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Upload service unavailable.",
        });
    }
});

export default router;
