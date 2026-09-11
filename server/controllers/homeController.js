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
    approach: {
        meta: "Small team. Big range.",
        metaSecondLine: "Always in your corner.",
        title: "Good technology",
        titleSecondLine: "should feel like",
        titleEmphasis: "good energy.",
        text: "We bring strategy, design, engineering, and intelligence into one room. No handoffs into the void. No mystery timelines. Just thoughtful work that keeps moving.",
        linkLabel: "Meet your new tech partner",
    },
    stats: [
        { value: "12+", label: "industries", detail: "served" },
        { value: "4.9★", label: "partner", detail: "rating" },
        { value: "∞", label: "ways to", detail: "move forward" },
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
