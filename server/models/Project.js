import mongoose from "mongoose";

const technologySchema = new mongoose.Schema(
    {
        category: { type: String, required: true, trim: true, maxlength: 80 },
        items: [{ type: String, trim: true, maxlength: 80 }],
    },
    { _id: false },
);

const milestoneSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        status: {
            type: String,
            enum: ["completed", "current", "upcoming"],
            default: "upcoming",
        },
        order: { type: Number, required: true },
    },
    { _id: false },
);

const updateSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 160 },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1200,
        },
        category: {
            type: String,
            enum: ["Development", "Design", "Testing", "Deployment", "General"],
            default: "General",
        },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true },
);

const activitySchema = new mongoose.Schema(
    {
        text: { type: String, required: true, trim: true, maxlength: 240 },
        actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true },
);

const projectSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },
        name: { type: String, required: true, trim: true, maxlength: 160 },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1200,
        },
        serviceType: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        status: {
            type: String,
            enum: [
                "Planning",
                "Design",
                "Development",
                "Testing",
                "Review",
                "Deployment",
                "Completed",
                "On Hold",
            ],
            default: "Planning",
        },
        progress: { type: Number, min: 0, max: 100, default: 0 },
        startDate: Date,
        expectedEndDate: Date,
        teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        technologies: [technologySchema],
        milestones: [milestoneSchema],
        updates: [updateSchema],
        activity: [activitySchema],
    },
    { timestamps: true },
);

export const Project = mongoose.model("Project", projectSchema);
