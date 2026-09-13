import mongoose from "mongoose";
import { isDatabaseReady } from "../config/database.js";
import {
    PortfolioProject,
    PORTFOLIO_CATEGORIES,
    PORTFOLIO_STATUSES,
} from "../models/PortfolioProject.js";
import { PortfolioUpdate } from "../models/PortfolioUpdate.js";

const PROJECT_FIELDS = [
    "title",
    "shortDescription",
    "description",
    "category",
    "coverImage",
    "images",
    "technologies",
    "services",
    "projectUrl",
    "completionDate",
    "status",
    "featured",
];
const UPDATE_FIELDS = [
    "title",
    "description",
    "date",
    "images",
    "technologies",
    "link",
];
const MAX_LIST_ITEMS = 40;
const UNAVAILABLE = "Portfolio management is temporarily unavailable.";

function unavailable(res, message) {
    return res.status(503).json({ success: false, message });
}

function validationMessage(error) {
    const first = Object.values(error.errors || {})[0];
    return first?.message || "Invalid portfolio data.";
}

// Normalize list inputs: accept an array or a single string (comma or
// newline separated), trim, drop empties, and cap the list size.
function stringList(value, maxItems = MAX_LIST_ITEMS) {
    if (value == null) return [];
    const items = (
        Array.isArray(value) ? value : String(value).split(/\r?\n|,/)
    )
        .map((item) => String(item).trim())
        .filter(Boolean);
    return items.slice(0, maxItems);
}

function normalizeProjectInput(body = {}) {
    const input = {};
    for (const field of PROJECT_FIELDS) {
        if (!Object.hasOwn(body, field)) continue;
        if (["images", "technologies", "services"].includes(field)) {
            input[field] = stringList(body[field]);
        } else if (field === "completionDate") {
            input[field] = body[field] ? new Date(body[field]) : null;
        } else if (field === "featured") {
            input[field] = Boolean(body[field]);
        } else {
            input[field] = body[field];
        }
    }
    return input;
}

function normalizeUpdateInput(body = {}) {
    const input = {};
    for (const field of UPDATE_FIELDS) {
        if (!Object.hasOwn(body, field)) continue;
        if (field === "images" || field === "technologies") {
            input[field] = stringList(body[field]);
        } else if (field === "date") {
            input[field] = body[field] ? new Date(body[field]) : new Date();
        } else {
            input[field] = body[field];
        }
    }
    return input;
}

export async function listAdminPortfolioProjects(_, res, next) {
    if (!isDatabaseReady()) {
        return unavailable(res, UNAVAILABLE);
    }
    try {
        const [projects, counts] = await Promise.all([
            PortfolioProject.find().sort({ updatedAt: -1 }).lean(),
            PortfolioUpdate.aggregate([
                { $group: { _id: "$portfolioProjectId", count: { $sum: 1 } } },
            ]),
        ]);
        const countByProject = new Map(
            counts.map((entry) => [String(entry._id), entry.count]),
        );
        const data = projects.map((project) => ({
            ...project,
            updateCount: countByProject.get(String(project._id)) || 0,
        }));
        return res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

export async function createPortfolioProject(req, res, next) {
    if (!isDatabaseReady()) {
        return unavailable(res, UNAVAILABLE);
    }
    try {
        const project = await PortfolioProject.create(
            normalizeProjectInput(req.body),
        );
        return res.status(201).json({ success: true, data: project });
    } catch (error) {
        if (error?.name === "ValidationError") {
            return res
                .status(400)
                .json({ success: false, message: validationMessage(error) });
        }
        next(error);
    }
}

export async function updatePortfolioProject(req, res, next) {
    if (!isDatabaseReady()) {
        return unavailable(res, UNAVAILABLE);
    }
    try {
        const project = await PortfolioProject.findByIdAndUpdate(
            req.params.id,
            { $set: normalizeProjectInput(req.body) },
            { new: true, runValidators: true },
        );
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Portfolio project not found.",
            });
        }
        return res.json({ success: true, data: project });
    } catch (error) {
        if (error?.name === "ValidationError") {
            return res
                .status(400)
                .json({ success: false, message: validationMessage(error) });
        }
        if (error?.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Portfolio project not found.",
            });
        }
        next(error);
    }
}

export async function deletePortfolioProject(req, res, next) {
    if (!isDatabaseReady()) {
        return unavailable(res, UNAVAILABLE);
    }
    try {
        const project = await PortfolioProject.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Portfolio project not found.",
            });
        }
        await PortfolioUpdate.deleteMany({ portfolioProjectId: project._id });
        return res.json({
            success: true,
            message: "Portfolio project deleted.",
        });
    } catch (error) {
        if (error?.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Portfolio project not found.",
            });
        }
        next(error);
    }
}

export async function listPortfolioUpdates(req, res, next) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
            .status(404)
            .json({ success: false, message: "Portfolio project not found." });
    }
    if (!isDatabaseReady()) {
        return unavailable(res, UNAVAILABLE);
    }
    try {
        const updates = await PortfolioUpdate.find({
            portfolioProjectId: id,
        })
            .sort({ date: -1, createdAt: -1 })
            .lean();
        return res.json({ success: true, data: updates });
    } catch (error) {
        next(error);
    }
}

export async function createPortfolioUpdate(req, res, next) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
            .status(404)
            .json({ success: false, message: "Portfolio project not found." });
    }
    if (!isDatabaseReady()) {
        return unavailable(res, UNAVAILABLE);
    }
    try {
        const project = await PortfolioProject.findById(id)
            .select("_id")
            .lean();
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Portfolio project not found.",
            });
        }
        const update = await PortfolioUpdate.create({
            ...normalizeUpdateInput(req.body),
            portfolioProjectId: id,
        });
        return res.status(201).json({ success: true, data: update });
    } catch (error) {
        if (error?.name === "ValidationError") {
            return res
                .status(400)
                .json({ success: false, message: validationMessage(error) });
        }
        next(error);
    }
}

export async function updatePortfolioUpdate(req, res, next) {
    const { id, updateId } = req.params;
    if (
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(updateId)
    ) {
        return res
            .status(404)
            .json({ success: false, message: "Portfolio update not found." });
    }
    if (!isDatabaseReady()) {
        return unavailable(res, UNAVAILABLE);
    }
    try {
        const update = await PortfolioUpdate.findOneAndUpdate(
            { _id: updateId, portfolioProjectId: id },
            { $set: normalizeUpdateInput(req.body) },
            { new: true, runValidators: true },
        );
        if (!update) {
            return res.status(404).json({
                success: false,
                message: "Portfolio update not found.",
            });
        }
        return res.json({ success: true, data: update });
    } catch (error) {
        if (error?.name === "ValidationError") {
            return res
                .status(400)
                .json({ success: false, message: validationMessage(error) });
        }
        next(error);
    }
}

export async function deletePortfolioUpdate(req, res, next) {
    const { id, updateId } = req.params;
    if (
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(updateId)
    ) {
        return res
            .status(404)
            .json({ success: false, message: "Portfolio update not found." });
    }
    if (!isDatabaseReady()) {
        return unavailable(res, UNAVAILABLE);
    }
    try {
        const update = await PortfolioUpdate.findOneAndDelete({
            _id: updateId,
            portfolioProjectId: id,
        });
        if (!update) {
            return res.status(404).json({
                success: false,
                message: "Portfolio update not found.",
            });
        }
        return res.json({ success: true, message: "Portfolio update deleted." });
    } catch (error) {
        next(error);
    }
}

export { PORTFOLIO_CATEGORIES, PORTFOLIO_STATUSES };
