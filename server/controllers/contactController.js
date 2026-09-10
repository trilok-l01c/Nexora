import { Contact } from "../models/Contact.js";
import { isDatabaseReady } from "../config/database.js";

export async function createContact(req, res, next) {
    if (!isDatabaseReady()) {
        return res
            .status(503)
            .json({
                success: false,
                message: "Contact submissions are temporarily unavailable.",
            });
    }

    try {
        await Contact.create(req.contactInput);
        return res
            .status(201)
            .json({
                success: true,
                message: "Your request has been submitted successfully.",
            });
    } catch (error) {
        next(error);
    }
}

export async function listContacts(req, res, next) {
    if (!isDatabaseReady()) {
        return res
            .status(503)
            .json({
                success: false,
                message: "Contact records are temporarily unavailable.",
            });
    }

    try {
        const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
        return res.status(200).json({ success: true, data: contacts });
    } catch (error) {
        next(error);
    }
}
