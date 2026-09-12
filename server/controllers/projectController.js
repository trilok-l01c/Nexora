import { Project } from "../models/Project.js";

const populate = [
    {
        path: "teamMembers",
        select: "name professionalTitle professionalBio avatarUrl",
    },
    { path: "updates.author", select: "name professionalTitle" },
];

export async function listProjects(_, res, next) {
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
