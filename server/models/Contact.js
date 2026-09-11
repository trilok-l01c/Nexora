import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
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
        attachments: [
            {
                originalName: { type: String, required: true, maxlength: 255 },
                storedName: { type: String, required: true, select: false },
                storagePath: { type: String, required: true, select: false },
                mimeType: { type: String, required: true, maxlength: 120 },
                size: { type: Number, required: true, max: 10 * 1024 * 1024 },
            },
        ],
        status: {
            type: String,
            enum: ["new", "contacted", "in_progress", "completed", "rejected"],
            default: "new",
            index: true,
        },
    },
    { timestamps: true },
);

export const Contact = mongoose.model("Contact", contactSchema);
