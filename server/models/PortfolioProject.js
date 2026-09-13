import mongoose from "mongoose";
import { httpUrlField, stringListField } from "../utils/schemaFields.js";

export const PORTFOLIO_CATEGORIES = [
    "Web Development",
    "Software Development",
    "Mobile Application",
    "AI & Automation",
    "Digital Solutions",
    "Digital Presence",
    "Social Media",
    "Other",
];

export const PORTFOLIO_STATUSES = ["Draft", "Published", "Archived"];

const portfolioProjectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 160 },
        shortDescription: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },
        description: { type: String, trim: true, maxlength: 8000 },
        category: {
            type: String,
            required: true,
            enum: PORTFOLIO_CATEGORIES,
        },
        coverImage: httpUrlField(),
        images: [httpUrlField()],
        technologies: stringListField(80, 40),
        services: stringListField(120, 40),
        projectUrl: httpUrlField(),
        completionDate: Date,
        status: {
            type: String,
            enum: PORTFOLIO_STATUSES,
            default: "Draft",
            index: true,
        },
        featured: { type: Boolean, default: false },
    },
    { timestamps: true },
);

export const PortfolioProject = mongoose.model(
    "PortfolioProject",
    portfolioProjectSchema,
);
