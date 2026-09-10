const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(req, res, next) {
    const { email, password } = req.body || {};

    if (
        typeof email !== "string" ||
        !email.trim() ||
        !emailPattern.test(email.trim())
    ) {
        return res
            .status(400)
            .json({ success: false, message: "A valid email is required." });
    }

    if (
        typeof password !== "string" ||
        password.length < 8 ||
        password.length > 128
    ) {
        return res
            .status(400)
            .json({ success: false, message: "A valid password is required." });
    }

    req.loginInput = { email: email.trim().toLowerCase(), password };
    next();
}
