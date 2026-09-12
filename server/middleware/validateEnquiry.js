const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEnquiry(req, res, next) {
    const { name, email, company, service, message } = req.body || {};
    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ success: false, message: "Name is required." });
    }
    if (typeof email !== "string" || !emailPattern.test(email.trim())) {
        return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }
    if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ success: false, message: "Message is required." });
    }
    if (company !== undefined && (typeof company !== "string" || company.length > 160)) {
        return res.status(400).json({ success: false, message: "Company information is invalid." });
    }
    if (service !== undefined && (typeof service !== "string" || service.length > 120)) {
        return res.status(400).json({ success: false, message: "Service information is invalid." });
    }
    if (message.length > 5000) {
        return res.status(400).json({ success: false, message: "Message is too long." });
    }
    req.enquiryInput = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: typeof company === "string" ? company.trim() : undefined,
        service: typeof service === "string" ? service.trim() : undefined,
        message: message.trim(),
    };
    next();
}