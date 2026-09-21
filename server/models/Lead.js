import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        // "note" is an internal message from the team, "status" and
        // "converted" entries are appended automatically so the timeline
        // also records lifecycle changes.
        type: {
            type: String,
            enum: ["note", "status", "converted"],
            default: "note",
        },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        authorName: { type: String, trim: true, maxlength: 254 },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
);

const leadSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 254,
        },
        phone: {
            type: String,
            trim: true,
            maxlength: 30,
        },
        company: {
            type: String,
            trim: true,
            maxlength: 120,
        },
        service: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },
        // Where the lead came from. Public enquiries are "website"; staff can
        // re-classify leads that arrived through another channel.
        source: {
            type: String,
            enum: ["website", "manual", "referral", "other"],
            default: "website",
        },
        status: {
            type: String,
            enum: ["new", "contacted", "in_progress", "completed", "rejected"],
            default: "new",
            index: true,
        },
        notes: [noteSchema],
        // Set when the lead is converted through the admin conversion
        // workflow. Enquiries never create these records implicitly.
        convertedCompanyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },
        convertedUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        convertedAt: Date,
    },
    { timestamps: true },
);

export const Lead = mongoose.model("Lead", leadSchema);