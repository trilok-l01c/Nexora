import mongoose from "mongoose";
import { isDatabaseReady } from "../config/database.js";
import { PortfolioProject } from "../models/PortfolioProject.js";
import { PortfolioUpdate } from "../models/PortfolioUpdate.js";

// Public endpoints never expose drafts/archived projects or private client
// project data; the portfolio is its own collection.
const publicFields =
    "title shortDescription description category coverImage images " +
    "technologies services projectUrl completionDate status featured " +
    "createdAt updatedAt";

function unavailable(res, message) {
    return res.status(503).json({ success: false, message });
}

export async function listPortfolioProjects(_, res, next) {
    if (!isDatabaseReady()) {
        return unavailable(res, "The portfolio is temporarily unavailable.");
    }
    try {
        const projects = await PortfolioProject.find({ status: "Published" })
            .select(publicFields)
            .sort({ featured: -1, completionDate: -1, updatedAt: -1 })
            .lean();
        return res.json({ success: true, data: projects });
    } catch (error) {
        next(error);
    }
}

export async function getPortfolioProject(req, res, next) {
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(404).json({
            success: false,
            message: "Portfolio project not found.",
        });
    }
    if (!isDatabaseReady()) {
        return unavailable(
            res,
            "This portfolio project is temporarily unavailable.",
        );
    }
    try {
        const project = await PortfolioProject.findOne({
            _id: projectId,
            status: "Published",
        })
            .select(publicFields)
            .lean();
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Portfolio project not found.",
            });
        }
        // Newest update first, per the public showcase order.
        const updates = await PortfolioUpdate.find({
            portfolioProjectId: project._id,
        })
            .select("title description date images technologies link createdAt")
            .sort({ date: -1, createdAt: -1 })
            .limit(50)
            .lean();
        return res.json({ success: true, data: { ...project, updates } });
    } catch (error) {
        next(error);
    }
}
