const validStatuses = new Set([
    "new",
    "contacted",
    "in_progress",
    "completed",
    "rejected",
]);

export function validateLeadStatus(req, res, next) {
    const { status } = req.body || {};

    if (typeof status !== "string" || !validStatuses.has(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid lead status.",
        });
    }

    req.leadStatus = status;
    next();
}
