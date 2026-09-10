export function errorHandler(error, _, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof SyntaxError && "body" in error) {
        return res
            .status(400)
            .json({ success: false, message: "Malformed JSON request body." });
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
