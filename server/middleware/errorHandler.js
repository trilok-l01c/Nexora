export function errorHandler(error, _, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof SyntaxError && "body" in error) {
        return res
            .status(400)
            .json({ success: false, message: "Malformed JSON request body." });
    }

    // Safety net for schema violations that slipped past request validation.
    // These are caused by the payload, not by the server, so reporting 500
    // told the caller to retry an input that can only fail again. Surfacing the
    // first field message keeps the response shape consistent with every other
    // validation failure in the API.
    if (error?.name === "ValidationError") {
        const first = Object.values(error.errors || {})[0];
        return res.status(400).json({
            success: false,
            message: first?.message || "Invalid request data.",
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
