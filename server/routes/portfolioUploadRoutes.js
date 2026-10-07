import { Router } from "express";
import { authenticateAdmin } from "../middleware/authenticateAdmin.js";
import { storeUpload } from "../services/uploadStorage.js";

// Note: multer is dynamically imported in the route handler to keep the
// dependency optional for environments that don't need file uploads.

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

        const upload = multer({
            // Buffer once, then pass it to either the local development
            // adapter or the configured persistent object-storage adapter.
            storage: multer.memoryStorage(),
            limits: { fileSize: MAX_FILE_SIZE },
            fileFilter: (_req, file, cb) => {
                if (ALLOWED_MIMES.has(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed."));
                }
            },
        }).single("image");

        upload(req, res, async (err) => {
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
            try {
                const imageUrl = await storeUpload(req.file);
                return res.status(201).json({
                    success: true,
                    data: { imageUrl },
                });
            } catch (error) {
                console.error("Portfolio upload storage failed:", error.message);
                return res.status(503).json({
                    success: false,
                    message: "Upload storage is temporarily unavailable.",
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Upload service unavailable.",
        });
    }
});

export default router;
