import mongoose from "mongoose";
import { isDatabaseReady } from "../config/database.js";
import { Company } from "../models/Company.js";
import { Project } from "../models/Project.js";
import { Ticket } from "../models/Ticket.js";
import { User } from "../models/User.js";

const publicMemberFields = "name professionalTitle professionalBio avatarUrl";
const projectPopulate = [
    { path: "teamMembers", select: publicMemberFields },
    { path: "updates.author", select: publicMemberFields },
    { path: "activity.actor", select: publicMemberFields },
];

function validId(value) {
    return mongoose.Types.ObjectId.isValid(value);
}

function safeProjectQuery(id, companyId) {
    return validId(id) ? { _id: id, companyId } : null;
}

export async function getDashboard(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Your project workspace is temporarily unavailable.",
        });
    }
    try {
        const [company, projects, tickets] = await Promise.all([
            Company.findById(req.user.companyId).select("name").lean(),
            Project.find({ companyId: req.user.companyId })
                .populate(projectPopulate)
                .sort({ updatedAt: -1 })
                .lean(),
            Ticket.find({ companyId: req.user.companyId })
                .select("number subject status priority projectId createdAt")
                .sort({ createdAt: -1 })
                .limit(8)
                .lean(),
        ]);

        const activity = projects
            .flatMap((project) =>
                (project.activity || []).map((item) => ({
                    ...item,
                    projectId: project._id,
                    projectName: project.name,
                    actor: item.actor?.name || "Nexora team",
                })),
            )
            .sort(
                (left, right) =>
                    new Date(right.createdAt) - new Date(left.createdAt),
            )
            .slice(0, 8);

        return res.json({
            success: true,
            data: { company, projects, activity, tickets },
        });
    } catch (error) {
        next(error);
    }
}

export async function getAccount(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Your account details are temporarily unavailable.",
        });
    }
    try {
        const [user, company] = await Promise.all([
            User.findById(req.user.sub)
                .select("name email phone role companyId createdAt")
                .lean(),
            Company.findById(req.user.companyId)
                .select("name createdAt")
                .lean(),
        ]);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "Account not found." });
        }
        return res.json({ success: true, data: { user, company } });
    } catch (error) {
        next(error);
    }
}

export async function updateAccount(req, res, next) {
    const { name, phone } = req.body || {};
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 120) {
        return res
            .status(400)
            .json({ success: false, message: "Please enter your full name." });
    }
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    if (trimmedPhone && !/^[+()\-.\s\d]{6,32}$/.test(trimmedPhone)) {
        return res
            .status(400)
            .json({ success: false, message: "Please enter a valid phone number." });
    }
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Your account details are temporarily unavailable.",
        });
    }
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.user.sub, companyId: req.user.companyId },
            { name: name.trim(), phone: trimmedPhone },
            {
                new: true,
                runValidators: true,
                select: "name email phone role companyId createdAt",
            },
        ).lean();
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "Account not found." });
        }
        return res.json({
            success: true,
            message: "Profile updated.",
            data: { user },
        });
    } catch (error) {
        next(error);
    }
}

export async function listClientProjects(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Your projects are temporarily unavailable.",
        });
    }
    try {
        const projects = await Project.find({ companyId: req.user.companyId })
            .populate(projectPopulate)
            .sort({ updatedAt: -1 })
            .lean();
        return res.json({ success: true, data: projects });
    } catch (error) {
        next(error);
    }
}

export async function createClientProject(req, res, next) {
    const {
        name,
        description,
        serviceType,
        requirements = "",
        preferredStartDate,
        expectedBudget,
    } = req.body || {};
    if (typeof name !== "string" || !name.trim()) {
        return res
            .status(400)
            .json({ success: false, message: "Project name is required." });
    }
    if (typeof description !== "string" || !description.trim()) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Project description is required.",
            });
    }
    if (typeof serviceType !== "string" || !serviceType.trim()) {
        return res
            .status(400)
            .json({ success: false, message: "Please choose a service type." });
    }
    if (typeof requirements !== "string" || requirements.length > 5000) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Project requirements are too long.",
            });
    }
    if (preferredStartDate && Number.isNaN(Date.parse(preferredStartDate))) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Preferred start date is invalid.",
            });
    }
    if (
        expectedBudget !== undefined &&
        (typeof expectedBudget !== "string" || expectedBudget.length > 120)
    ) {
        return res
            .status(400)
            .json({ success: false, message: "Expected budget is invalid." });
    }
    if (!isDatabaseReady()) {
        return res
            .status(503)
            .json({
                success: false,
                message: "Project requests are temporarily unavailable.",
            });
    }
    try {
        const project = await Project.create({
            companyId: req.user.companyId,
            name: name.trim(),
            description: description.trim(),
            serviceType: serviceType.trim(),
            requirements: requirements.trim(),
            preferredStartDate: preferredStartDate || undefined,
            expectedBudget: expectedBudget?.trim(),
            status: "Pending Review",
            progress: 0,
            milestones: [],
            updates: [],
            activity: [{ text: "Project request submitted" }],
        });
        return res.status(201).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
}

export async function getProject(req, res, next) {
    const query = safeProjectQuery(req.params.projectId, req.user.companyId);
    if (!query)
        return res
            .status(404)
            .json({ success: false, message: "Project not found." });
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "This project is temporarily unavailable.",
        });
    }
    try {
        const project = await Project.findOne(query)
            .populate(projectPopulate)
            .lean();
        if (!project)
            return res
                .status(404)
                .json({ success: false, message: "Project not found." });
        return res.json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
}

export async function createTicket(req, res, next) {
    const {
        subject,
        description,
        priority = "Normal",
        projectId,
    } = req.body || {};
    if (
        typeof subject !== "string" ||
        !subject.trim() ||
        typeof description !== "string" ||
        !description.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "Subject and description are required.",
        });
    }
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Support requests are temporarily unavailable.",
        });
    }
    if (!["Low", "Normal", "High", "Urgent"].includes(priority)) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid ticket priority." });
    }
    try {
        let project;
        if (projectId) {
            const query = safeProjectQuery(projectId, req.user.companyId);
            if (!query)
                return res.status(404).json({
                    success: false,
                    message: "Related project not found.",
                });
            project = await Project.findOne(query).select("_id").lean();
            if (!project)
                return res.status(404).json({
                    success: false,
                    message: "Related project not found.",
                });
        }
        const ticket = await Ticket.create({
            companyId: req.user.companyId,
            createdBy: req.user.sub,
            projectId: project?._id,
            subject: subject.trim(),
            description: description.trim(),
            priority,
        });
        return res.status(201).json({
            success: true,
            data: { number: ticket.number, status: ticket.status },
        });
    } catch (error) {
        next(error);
    }
}
