const validStatuses = new Set([
    "new",
    "contacted",
    "in_progress",
    "completed",
    "rejected",
]);

// Restored from the previous lead lifecycle: a lead moves forward one step at a
// time and only an open lead can be lost. Terminal states stay terminal.
//
// `completed` means "converted to client", so it is deliberately NOT reachable
// from this map. Conversion is an explicit business action (`convertLead`) and
// nothing else may set that status — otherwise a single mis-click on the status
// dropdown would permanently mark a lead as converted without ever creating a
// client account, and the terminal state would make it impossible to undo.
const allowedTransitions = {
    new: new Set(["new", "contacted", "rejected"]),
    contacted: new Set(["contacted", "in_progress", "rejected"]),
    in_progress: new Set(["in_progress", "rejected"]),
    completed: new Set(["completed"]),
    rejected: new Set(["rejected"]),
};

// Human-readable labels used when writing lifecycle entries to the lead
// timeline.
const statusLabels = {
    new: "New",
    contacted: "Contacted",
    in_progress: "In progress",
    completed: "Converted to client",
    rejected: "Lost",
};

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

export { validStatuses, allowedTransitions, statusLabels };