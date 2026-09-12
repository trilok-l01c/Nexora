const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup(req, res, next) {
    const { name, email, company, password, confirmPassword } = req.body || {};

    if (
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 120
    ) {
        return res
            .status(400)
            .json({ success: false, message: "Please enter your full name." });
    }
    if (
        typeof email !== "string" ||
        !emailPattern.test(email.trim()) ||
        email.trim().length > 254
    ) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Please enter a valid work email.",
            });
    }
    if (
        typeof company !== "string" ||
        company.trim().length < 2 ||
        company.trim().length > 160
    ) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Please enter your company name.",
            });
    }
    if (
        typeof password !== "string" ||
        password.length < 8 ||
        password.length > 128
    ) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Password must be 8 to 128 characters.",
            });
    }
    if (password !== confirmPassword) {
        return res
            .status(400)
            .json({ success: false, message: "Passwords do not match." });
    }

    req.signupInput = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company.trim(),
        password,
    };
    next();
}
