const TICKET_STATUSES = ["Open", "In Progress", "Resolved"];
const TICKET_PRIORITIES = ["Low", "Normal", "High", "Urgent"];

// Triaging a support ticket only ever changes where it sits in the workflow.
// Nothing is required: an absent field is left untouched, so the admin UI can
// PATCH a single value. An explicitly invalid value is still rejected.
export function validateTicketUpdate(req, res, next) {
    const body = req.body || {};
    const changes = {};
    let provided = false;

    if (Object.hasOwn(body, "status")) {
        if (
            typeof body.status !== "string" ||
            !TICKET_STATUSES.includes(body.status)
        ) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid support query status." });
        }
        changes.status = body.status;
        provided = true;
    }

    if (Object.hasOwn(body, "priority")) {
        if (
            typeof body.priority !== "string" ||
            !TICKET_PRIORITIES.includes(body.priority)
        ) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid support query priority." });
        }
        changes.priority = body.priority;
        provided = true;
    }

    if (!provided) {
        return res.status(400).json({
            success: false,
            message: "Provide a status or priority to update.",
        });
    }

    req.ticketChanges = changes;
    next();
}

export { TICKET_STATUSES, TICKET_PRIORITIES };