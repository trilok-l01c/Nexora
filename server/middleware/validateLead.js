const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d][\d\s().-]{6,29}$/;

export function validateLead(req, res, next) {
    const { name, email, phone, company, service, message } = req.body || {};
    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ success: false, message: "Name is required." });
    }
    if (typeof email !== "string" || !emailPattern.test(email.trim())) {
        return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }
    if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ success: false, message: "Message is required." });
    }
    if (typeof service !== "string" || !service.trim()) {
        return res.status(400).json({ success: false, message: "Please select a service." });
    }
    if (phone !== undefined && phone !== "" && (typeof phone !== "string" || !phonePattern.test(phone.trim()))) {
        return res.status(400).json({ success: false, message: "Please enter a valid phone number." });
    }
    if (company !== undefined && (typeof company !== "string" || company.length > 120)) {
        return res.status(400).json({ success: false, message: "Company information is invalid." });
    }
    if (service.length > 120) {
        return res.status(400).json({ success: false, message: "Service information is invalid." });
    }
    if (message.length > 5000) {
        return res.status(400).json({ success: false, message: "Message is too long." });
    }
    req.leadInput = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: typeof phone === "string" && phone.trim() ? phone.trim() : undefined,
        company: typeof company === "string" && company.trim() ? company.trim() : undefined,
        service: service.trim(),
        message: message.trim(),
    };
    next();
}