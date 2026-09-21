export function validateLeadNote(req, res, next) {
    const { text } = req.body || {};

    if (typeof text !== "string" || !text.trim()) {
        return res
            .status(400)
            .json({ success: false, message: "Note text is required." });
    }
    if (text.trim().length > 2000) {
        return res
            .status(400)
            .json({ success: false, message: "Note is too long." });
    }

    req.leadNote = text.trim();
    next();
}