import { Contact } from "../models/Contact.js";
import { isDatabaseReady } from "../config/database.js";

const validStatuses = new Set([
    "new",
    "contacted",
    "in_progress",
    "completed",
    "rejected",
]);

const allowedTransitions = {
    new: new Set(["new", "contacted", "rejected"]),
    contacted: new Set(["contacted", "in_progress", "rejected"]),
    in_progress: new Set(["in_progress", "completed", "rejected"]),
    completed: new Set(["completed"]),
    rejected: new Set(["rejected"]),
};

export async function createContact(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Contact submissions are temporarily unavailable.",
        });
    }

    try {
        await Contact.create(req.contactInput);
        return res.status(201).json({
            success: true,
            message: "Your request has been submitted successfully.",
        });
    } catch (error) {
        next(error);
    }
}

export async function listContacts(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Contact records are temporarily unavailable.",
        });
    }

    try {
        if (req.query.status && !validStatuses.has(req.query.status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid lead status filter.",
            });
        }
        const filter = req.query.status ? { status: req.query.status } : {};
        const contacts = await Contact.find(filter)
            .sort({ createdAt: -1 })
            .lean();
        return res.status(200).json({ success: true, data: contacts });
    } catch (error) {
        next(error);
    }
}

export async function getContact(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Contact records are temporarily unavailable.",
        });
    }

    try {
        const contact = await Contact.findById(req.params.id).lean();
        if (!contact) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found." });
        }
        return res.status(200).json({ success: true, data: contact });
    } catch (error) {
        if (error.name === "CastError") {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found." });
        }
        next(error);
    }
}

export async function updateContactStatus(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Contact records are temporarily unavailable.",
        });
    }

    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found." });
        }
        if (!allowedTransitions[contact.status]?.has(req.leadStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid lead status transition.",
            });
        }
        contact.status = req.leadStatus;
        await contact.save();
        return res.status(200).json({
            success: true,
            message: "Lead status updated.",
            data: contact.toObject(),
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found." });
        }
        next(error);
    }
}
