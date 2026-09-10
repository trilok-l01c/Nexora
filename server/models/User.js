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
            enum: ["admin"],
            default: "admin",
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
