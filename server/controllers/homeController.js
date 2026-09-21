import { HomeContent } from "../models/HomeContent.js";

const defaultContent = {
    hero: {
        eyebrow: "Independent digital studio / 2026",
        title: "Build what",
        titleEmphasis: "moves",
        titleSuffix: "people.",
        text: "Nexora turns ambitious ideas into intelligent digital products, from the first line of code to the last meaningful interaction.",
    },
    ticker: [
        "Full-stack development",
        "Intelligent systems",
        "Digital momentum",
        "Human-first technology",
    ],
};

function contentOrDefault(content) {
    return content && typeof content === "object" ? content : defaultContent;
}

export async function getHomeContent(req, res, next) {
    try {
        const document = await HomeContent.findOne({ key: "home" }).lean();
        return res.json({
            success: true,
            data: contentOrDefault(document?.content),
        });
    } catch (error) {
        next(error);
    }
}

export async function updateHomeContent(req, res, next) {
    const content = req.body?.content;
    if (!content || typeof content !== "object" || Array.isArray(content)) {
        return res.status(400).json({
            success: false,
            message: "Homepage content must be a JSON object.",
        });
    }

    try {
        const document = await HomeContent.findOneAndUpdate(
            { key: "home" },
            { $set: { content } },
            { new: true, upsert: true, runValidators: true },
        ).lean();
        return res.json({ success: true, data: document.content });
    } catch (error) {
        next(error);
    }
}

export { defaultContent };
