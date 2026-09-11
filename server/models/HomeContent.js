import mongoose from "mongoose";

const homeContentSchema = new mongoose.Schema(
    {
        key: { type: String, default: "home", unique: true },
        content: { type: mongoose.Schema.Types.Mixed, required: true },
    },
    { timestamps: true },
);

export const HomeContent = mongoose.model("HomeContent", homeContentSchema);
