const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d][\d\s().-]{6,29}$/;
const validSources = new Set(["website", "manual", "referral", "other"]);

// Admin update of lead contact details. Every field is optional — only the
// provided keys are applied, mirroring the partial-update style used by the
// other admin PATCH handlers.
export function validateLeadUpdate(req, res, next) {
    const body = req.body || {};
    const update = {};

    if (body.name !== undefined) {
        if (typeof body.name !== "string" || !body.name.trim()) {
            return res
                .status(400)
                .json({ success: false, message: "Name is required." });
        }
        if (body.name.trim().length > 100) {
            return res
                .status(400)
                .json({ success: false, message: "Name is too long." });
        }
        update.name = body.name.trim();
    }

    if (body.email !== undefined) {
        if (
            typeof body.email !== "string" ||
            !emailPattern.test(body.email.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }
        update.email = body.email.trim().toLowerCase();
    }

    if (body.phone !== undefined) {
        const phone = typeof body.phone === "string" ? body.phone.trim() : "";
        if (phone && !phonePattern.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid phone number.",
            });
        }
        update.phone = phone || undefined;
    }

    if (body.company !== undefined) {
        if (typeof body.company !== "string" || body.company.length > 120) {
            return res.status(400).json({
                success: false,
                message: "Company information is invalid.",
            });
        }
        update.company = body.company.trim() || undefined;
    }

    if (body.service !== undefined) {
        if (typeof body.service !== "string" || !body.service.trim()) {
            return res
                .status(400)
                .json({ success: false, message: "Please select a service." });
        }
        if (body.service.trim().length > 120) {
            return res.status(400).json({
                success: false,
                message: "Service information is invalid.",
            });
        }
        update.service = body.service.trim();
    }

    if (body.source !== undefined) {
        if (
            typeof body.source !== "string" ||
            !validSources.has(body.source)
        ) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid lead source." });
        }
        update.source = body.source;
    }

    if (Object.keys(update).length === 0) {
        return res.status(400).json({
            success: false,
            message: "No lead changes were provided.",
        });
    }

    req.leadUpdate = update;
    next();
}