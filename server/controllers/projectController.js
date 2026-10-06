import { isDatabaseReady } from "../config/database.js";
import { Project } from "../models/Project.js";

const DATABASE_UNAVAILABLE = "Projects are temporarily unavailable.";

const populate = [
    {
        path: "teamMembers",
        select: "name professionalTitle professionalBio avatarUrl",
    },
    { path: "updates.author", select: "name professionalTitle" },
];

export async function listProjects(_, res, next) {
    // Every other controller guards on the connection first. Without it a
    // dropped database made Mongoose buffer the query for 10 seconds and then
    // time out, so the request hung and returned 500 instead of a fast 503.
    if (!isDatabaseReady()) {
        return res
            .status(503)
            .json({ success: false, message: DATABASE_UNAVAILABLE });
    }
    try {
        const projects = await Project.find()
            .populate(populate)
            .sort({ updatedAt: -1 })
            .lean();
        return res.json({ success: true, data: projects });
    } catch (error) {
        next(error);
    }
}

export async function createProject(req, res, next) {
    if (!isDatabaseReady()) {
        return res
            .status(503)
            .json({ success: false, message: DATABASE_UNAVAILABLE });
    }
    try {
        const allowedFields = [
            "companyId",
            "name",
            "description",
            "requirements",
            "serviceType",
            "preferredStartDate",
            "expectedBudget",
            "status",
            "progress",
            "startDate",
            "expectedEndDate",
            "teamMembers",
            "technologies",
            "milestones",
            "updates",
            "activity",
        ];
        const input = Object.fromEntries(
            allowedFields
                .filter((field) => Object.hasOwn(req.body || {}, field))
                .map((field) => [field, req.body[field]]),
        );
        const project = await Project.create(input);
        return res.status(201).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
}

export async function updateProject(req, res, next) {
    if (!isDatabaseReady()) {
        return res
            .status(503)
            .json({ success: false, message: DATABASE_UNAVAILABLE });
    }
    try {
        const staffFields = [
            "status",
            "progress",
            "startDate",
            "expectedEndDate",
            "teamMembers",
            "technologies",
            "milestones",
            "updates",
            "activity",
        ];
        const changes = Object.fromEntries(
            staffFields
                .filter((field) => Object.hasOwn(req.body || {}, field))
                .map((field) => [field, req.body[field]]),
        );
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: changes },
            { new: true, runValidators: true },
        ).populate(populate);
        if (!project)
            return res
                .status(404)
                .json({ success: false, message: "Project not found." });
        return res.json({ success: true, data: project });
    } catch (error) {
        if (error.name === "CastError")
            return res
                .status(404)
                .json({ success: false, message: "Project not found." });
        next(error);
    }
}
