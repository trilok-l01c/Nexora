import fs from "node:fs";
import path from "node:path";
import { Contact } from "../models/Contact.js";
import { isDatabaseReady } from "../config/database.js";
import { uploadDirectory } from "../middleware/uploadContactFiles.js";

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

function serializeContact(contact) {
    const serialized = { ...contact };
    if (serialized.attachments) {
        serialized.attachments = serialized.attachments.map((attachment) => ({
            _id: attachment._id,
            originalName: attachment.originalName,
            mimeType: attachment.mimeType,
            size: attachment.size,
            downloadUrl: `/api/admin/leads/${serialized._id}/attachments/${attachment._id}`,
        }));
    }
    return serialized;
}

function attachmentQuery(query) {
    return query.select("+attachments.storedName +attachments.storagePath");
}

export async function createContact(req, res, next) {
    const files = req.files || [];
    if (!isDatabaseReady()) {
        await Promise.all(
            files.map((file) =>
                fs.promises.unlink(file.path).catch(() => undefined),
            ),
        );
        return res.status(503).json({
            success: false,
            message: "Contact submissions are temporarily unavailable.",
        });
    }

    try {
        await Contact.create({
            ...req.contactInput,
            attachments: files.map((file) => ({
                originalName: file.originalname,
                storedName: file.filename,
                storagePath: file.path,
                mimeType: file.mimetype,
                size: file.size,
            })),
        });
        return res.status(201).json({
            success: true,
            message: "Your request has been submitted successfully.",
        });
    } catch (error) {
        await Promise.all(
            files.map((file) =>
                fs.promises.unlink(file.path).catch(() => undefined),
            ),
        );
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
        const contacts = await attachmentQuery(Contact.find(filter))
            .sort({ createdAt: -1 })
            .lean();
        return res.status(200).json({
            success: true,
            data: contacts.map(serializeContact),
        });
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
        const contact = await attachmentQuery(
            Contact.findById(req.params.id),
        ).lean();
        if (!contact) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found." });
        }
        return res
            .status(200)
            .json({ success: true, data: serializeContact(contact) });
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
        const contact = await attachmentQuery(Contact.findById(req.params.id));
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
            data: serializeContact(contact.toObject()),
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

export async function downloadContactAttachment(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Contact records are temporarily unavailable.",
        });
    }

    try {
        const contact = await attachmentQuery(
            Contact.findById(req.params.id),
        ).lean();
        const attachment = contact?.attachments?.find(
            (item) => String(item._id) === req.params.attachmentId,
        );
        if (!attachment) {
            return res
                .status(404)
                .json({ success: false, message: "Attachment not found." });
        }

        const resolvedPath = path.resolve(attachment.storagePath);
        if (!resolvedPath.startsWith(`${uploadDirectory}${path.sep}`)) {
            return res
                .status(404)
                .json({ success: false, message: "Attachment not found." });
        }
        return res.download(resolvedPath, attachment.originalName);
    } catch (error) {
        if (error.name === "CastError") {
            return res
                .status(404)
                .json({ success: false, message: "Attachment not found." });
        }
        next(error);
    }
}
