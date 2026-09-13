import mongoose from "mongoose";
import { httpUrlField, stringListField } from "../utils/schemaFields.js";

const portfolioUpdateSchema = new mongoose.Schema(
    {
        portfolioProjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PortfolioProject",
            required: true,
            index: true,
        },
        title: { type: String, required: true, trim: true, maxlength: 160 },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 4000,
        },
        date: { type: Date, required: true },
        images: [httpUrlField()],
        technologies: stringListField(80, 40),
        link: httpUrlField(),
    },
    { timestamps: true },
);

export const PortfolioUpdate = mongoose.model(
    "PortfolioUpdate",
    portfolioUpdateSchema,
);
