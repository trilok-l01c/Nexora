const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Conversion is an explicit business decision: the admin chooses the company
// record to attach the client to (reusing an existing company with the same
// name) and sets the first portal password, which is shared with the lead
// outside of this system.
export function validateLeadConversion(req, res, next) {
    const { companyName, clientName, email, phone, password } = req.body || {};

    if (
        typeof companyName !== "string" ||
        !companyName.trim() ||
        companyName.trim().length > 160
    ) {
        return res
            .status(400)
            .json({ success: false, message: "Company name is required." });
    }
    if (typeof clientName !== "string" || clientName.trim().length < 2) {
        return res
            .status(400)
            .json({ success: false, message: "Please enter the client's full name." });
    }
    if (clientName.trim().length > 120) {
        return res
            .status(400)
            .json({ success: false, message: "Client name is too long." });
    }
    if (typeof email !== "string" || !emailPattern.test(email.trim())) {
        return res
            .status(400)
            .json({ success: false, message: "Please enter a valid email address." });
    }
    if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters.",
        });
    }
    if (password.length > 128) {
        return res
            .status(400)
            .json({ success: false, message: "Password is too long." });
    }
    if (phone !== undefined && phone !== "") {
        if (typeof phone !== "string" || phone.trim().length > 32) {
            return res.status(400).json({
                success: false,
                message: "Phone information is invalid.",
            });
        }
    }

    req.conversionInput = {
        companyName: companyName.trim(),
        clientName: clientName.trim(),
        email: email.trim().toLowerCase(),
        phone: typeof phone === "string" && phone.trim() ? phone.trim() : undefined,
        password,
    };
    next();
}