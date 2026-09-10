const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d][\d\s().-]{6,29}$/;

const fields = {
    name: { required: true, max: 100 },
    email: { required: true, max: 254 },
    phone: { required: false, max: 30 },
    company: { required: false, max: 120 },
    service: { required: true, max: 120 },
    message: { required: true, max: 5000 },
};

export function validateContact(req, res, next) {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Request body must be a JSON object.",
            });
    }

    const allowedFields = new Set(Object.keys(fields));
    const unknownField = Object.keys(body).find(
        (field) => !allowedFields.has(field),
    );
    if (unknownField) {
        return res
            .status(400)
            .json({
                success: false,
                message: `Unsupported field: ${unknownField}.`,
            });
    }

    for (const [field, rules] of Object.entries(fields)) {
        const value = body[field];
        if (rules.required && (typeof value !== "string" || !value.trim())) {
            return res
                .status(400)
                .json({ success: false, message: `${field} is required.` });
        }
        if (
            value !== undefined &&
            (typeof value !== "string" || value.trim().length > rules.max)
        ) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: `${field} is invalid or too long.`,
                });
        }
    }

    const email = body.email?.trim();
    if (email && !emailPattern.test(email)) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid email address." });
    }

    const phone = body.phone?.trim();
    if (phone && !phonePattern.test(phone)) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid phone number." });
    }

    req.contactInput = Object.fromEntries(
        Object.entries(body)
            .filter(([, value]) => typeof value === "string")
            .map(([key, value]) => [key, value.trim()]),
    );
    next();
}
