import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Lead } from "../models/Lead.js";
import { Company } from "../models/Company.js";
import { User } from "../models/User.js";
import { isDatabaseReady } from "../config/database.js";
import {
    allowedTransitions,
    statusLabels,
    validStatuses,
} from "../middleware/validateLeadStatus.js";

function authorName(req) {
    return req.user?.email || "Nexora team";
}

// Timeline entries record who did what. Admin JWTs carry the user id in
// `sub`, but only reference it when it is a valid ObjectId so signed test
// tokens cannot corrupt the document.
function appendNote(lead, { text, type, req }) {
    const entry = { text, type, authorName: authorName(req) };
    if (mongoose.Types.ObjectId.isValid(req.user?.sub)) {
        entry.author = req.user.sub;
    }
    lead.notes.push(entry);
}

export async function createLead(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Contact requests are temporarily unavailable.",
        });
    }

    try {
        await Lead.create(req.leadInput);
        return res.status(201).json({
            success: true,
            message: "Your message has been sent to Nexora.",
        });
    } catch (error) {
        next(error);
    }
}

export async function listLeads(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Lead records are temporarily unavailable.",
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
        const leads = await Lead.find(filter).sort({ createdAt: -1 }).lean();
        return res.status(200).json({
            success: true,
            data: leads,
        });
    } catch (error) {
        next(error);
    }
}

export async function getLead(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Lead records are temporarily unavailable.",
        });
    }

    try {
        const lead = await Lead.findById(req.params.id).lean();
        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found." });
        }
        return res.status(200).json({ success: true, data: lead });
    } catch (error) {
        if (error.name === "CastError") {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found." });
        }
        next(error);
    }
}

export async function updateLead(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Lead records are temporarily unavailable.",
        });
    }

    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found." });
        }

        Object.assign(lead, req.leadUpdate);
        await lead.save();

        return res.status(200).json({
            success: true,
            message: "Lead updated.",
            data: lead.toObject(),
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

export async function updateLeadStatus(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Lead records are temporarily unavailable.",
        });
    }

    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found." });
        }
        if (!allowedTransitions[lead.status]?.has(req.leadStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid lead status transition.",
            });
        }

        if (lead.status !== req.leadStatus) {
            lead.status = req.leadStatus;
            appendNote(lead, {
                text: `Status changed to ${statusLabels[req.leadStatus]}.`,
                type: "status",
                req,
            });
            await lead.save();
        }

        return res.status(200).json({
            success: true,
            message: "Lead status updated.",
            data: lead.toObject(),
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

export async function addLeadNote(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Lead records are temporarily unavailable.",
        });
    }

    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found." });
        }

        appendNote(lead, { text: req.leadNote, type: "note", req });
        await lead.save();

        return res.status(201).json({
            success: true,
            message: "Note added.",
            data: lead.toObject(),
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

export async function updateLeadNote(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Lead records are temporarily unavailable.",
        });
    }

    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found." });
        }

        const note = lead.notes.id(req.params.noteId);
        if (!note) {
            return res
                .status(404)
                .json({ success: false, message: "Note not found." });
        }
        if (note.type !== "note") {
            return res.status(400).json({
                success: false,
                message: "Automatic timeline entries cannot be edited.",
            });
        }

        note.text = req.leadNote;
        await lead.save();

        return res.status(200).json({
            success: true,
            message: "Note updated.",
            data: lead.toObject(),
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Lead or note not found.",
            });
        }
        next(error);
    }
}

function companySlug(name) {
    return (
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "company"
    );
}

// Same company-matching rule as client signup: an exact, case-insensitive
// name match reuses the existing company instead of creating a duplicate.
async function findOrCreateCompany(companyName) {
    const escaped = companyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let company = await Company.findOne({
        name: new RegExp(`^${escaped}$`, "i"),
    });
    if (!company) {
        const baseSlug = companySlug(companyName);
        company = await Company.create({
            name: companyName,
            slug: `${baseSlug}-${Date.now().toString(36)}`,
        });
    }
    return company;
}

// Conversion is an explicit business decision taken by staff after the
// follow-up conversation. It creates the client's portal account (reusing an
// existing company with the same name) and closes the lead. Submitting a
// public enquiry never reaches this code path.
export async function convertLead(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Lead records are temporarily unavailable.",
        });
    }

    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found." });
        }
        if (lead.convertedAt || lead.status === "completed") {
            return res.status(409).json({
                success: false,
                message: "This lead has already been converted.",
            });
        }

        const { companyName, clientName, email, phone, password } =
            req.conversionInput;

        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    existingUser.email === lead.email
                        ? "A user account already exists for this email. Link the lead to that account manually instead of creating a duplicate."
                        : "A user account with this email already exists.",
            });
        }

        const company = await findOrCreateCompany(companyName);
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({
            name: clientName,
            email,
            phone,
            passwordHash,
            companyId: company._id,
            role: "client",
        });

        lead.convertedCompanyId = company._id;
        lead.convertedUserId = user._id;
        lead.convertedAt = new Date();
        lead.status = "completed";
        appendNote(lead, {
            text: `Converted to client for ${company.name}. Portal credentials were created for ${user.email}.`,
            type: "converted",
            req,
        });
        await lead.save();

        return res.status(200).json({
            success: true,
            message:
                "Lead converted. The client can now sign in to the portal.",
            data: {
                lead: lead.toObject(),
                company: { id: company.id, name: company.name },
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    companyId: user.companyId,
                },
            },
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found." });
        }
        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "An account or company with these details already exists.",
            });
        }
        next(error);
    }
}

