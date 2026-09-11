import multer from "multer";

export function errorHandler(error, _, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof SyntaxError && "body" in error) {
        return res
            .status(400)
            .json({ success: false, message: "Malformed JSON request body." });
    }

    if (error instanceof multer.MulterError) {
        const message =
            error.code === "LIMIT_FILE_SIZE"
                ? "Each attachment must be 10 MB or smaller."
                : error.code === "LIMIT_FILE_COUNT"
                  ? "You can attach up to 5 files."
                  : "Attachments must be PDF, office document, text, or image files.";
        return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
            success: false,
            message,
        });
    }

    console.error("Request error:", error);
    return res.status(500).json({
        success: false,
        message: "Something went wrong on the server.",
    });
}

export function notFound(req, res) {
    res.status(404).json({ success: false, message: "Route not found." });
}
