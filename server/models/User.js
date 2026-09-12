import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
        },
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            enum: ["admin", "staff", "client"],
            default: "client",
        },
        name: {
            type: String,
            trim: true,
            maxlength: 120,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },
        professionalTitle: {
            type: String,
            trim: true,
            maxlength: 120,
        },
        professionalBio: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        avatarUrl: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
