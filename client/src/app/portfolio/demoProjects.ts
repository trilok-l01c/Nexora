import type {
    PortfolioProject,
    PortfolioProjectDetail,
    PortfolioUpdate,
} from "../portfolioTypes";

/**
 * Bundled sample case studies.
 *
 * These exist so the showcase never renders an empty page when the portfolio
 * API is unreachable or has no published projects yet (for example while the
 * backend is offline, or on a fresh install before anything is published).
 * They are clearly labelled in the UI via `[data-demo-notice]` and are never
 * persisted anywhere: the API and its data model are untouched.
 *
 * Cover artwork: the supplied cover screenshots in `public/Project-cover-pages`
 * are used as `coverImage`, which is what drives the showcase hero media, the
 * pinned frame of each case study and the cover on the detail page.
 *
 * Set `USE_DEMO_FALLBACK` to false to go back to the plain empty state.
 */
export const USE_DEMO_FALLBACK = true;

// Sample ids are prefixed so they can never collide with a MongoDB ObjectId,
// which keeps the demo detail routes unambiguous.
export const DEMO_PROJECT_IDS = {
    restaurantOrdering: "demo-restaurant-ordering",
    aiSupport: "demo-ai-support",
    fieldOps: "demo-field-ops",
    accountsPortal: "demo-accounts-portal",
    portfolioExperience: "demo-portfolio-experience",
} as const;

/**
 * Resolve one of the supplied cover screenshots.
 *
 * Keeping the folder in a single helper means a sample cover can be swapped or
 * re-pointed at real client artwork by editing one line per project.
 */
function coverPage(file: string): string {
    return `/Project-cover-pages/${file}`;
}

export const demoProjects: PortfolioProject[] = [
    {
        _id: DEMO_PROJECT_IDS.restaurantOrdering,
        title: "Restaurant Ordering Platform",
        shortDescription:
            "Online ordering, table reservations, and kitchen-side order tracking in one responsive build.",
        description:
            "A single ordering platform that covers the whole guest journey: browsing the menu, placing an order for delivery or pickup, and booking a table for a later date.\n\nThe build is split into a customer-facing storefront and a kitchen view that both read from the same order state, so front-of-house and the kitchen never disagree about what is in progress. Menus, availability, and opening hours are managed without a redeploy.",
        category: "Web Development",
        coverImage: coverPage("cover1.png"),
        images: ["/for-grocery-shop.jpg", "/working-peoples-2.jpg"],
        technologies: ["Next.js", "TypeScript", "Node.js", "MongoDB"],
        services: ["Web Development", "Digital Presence"],
        completionDate: "2025-02-18T00:00:00.000Z",
        status: "Published",
        featured: true,
        createdAt: "2025-01-08T00:00:00.000Z",
        updatedAt: "2025-02-18T00:00:00.000Z",
    },
    {
        _id: DEMO_PROJECT_IDS.aiSupport,
        title: "AI Support Assistant",
        shortDescription:
            "A retrieval-backed assistant that answers customer questions from the company's own documentation.",
        description:
            "An assistant that answers support questions using the organisation's own knowledge base instead of guessing. Content is indexed ahead of time, and every answer is generated from the retrieved passages, with links back to the source material.\n\nWhen the confident match rate drops below a threshold the conversation is handed to a human with the full transcript attached, so nothing is silently dropped.",
        category: "AI & Automation",
        coverImage: coverPage("cover2.png"),
        images: ["/health-tech.jpg", "/indian-programmer.jpg"],
        technologies: ["Next.js", "Node.js", "MongoDB", "Vector search"],
        services: ["AI & Automation", "Software Development"],
        completionDate: "2025-04-09T00:00:00.000Z",
        status: "Published",
        featured: true,
        createdAt: "2025-03-01T00:00:00.000Z",
        updatedAt: "2025-04-09T00:00:00.000Z",
    },
    {
        _id: DEMO_PROJECT_IDS.fieldOps,
        title: "Field Service Operations App",
        shortDescription:
            "Scheduling, checklists, and offline-capable job updates for technicians working on site.",
        description:
            "A mobile app for technicians who spend their day away from a desk. Jobs arrive with the site details, the required checklist, and the parts expected on the van.\n\nUpdates queue locally when signal drops and sync as soon as a connection returns, so a completed job is never lost to a dead zone.",
        category: "Mobile Application",
        coverImage: coverPage("cover3.png"),
        images: ["/city-in-night.jpg", "/working-peoples.jpg"],
        technologies: ["React Native", "Node.js", "MongoDB"],
        services: ["Mobile Application"],
        completionDate: "2025-01-24T00:00:00.000Z",
        status: "Published",
        createdAt: "2024-12-04T00:00:00.000Z",
        updatedAt: "2025-01-24T00:00:00.000Z",
    },
    {
        _id: DEMO_PROJECT_IDS.accountsPortal,
        title: "Accounts & Compliance Portal",
        shortDescription:
            "A client workspace for invoices, statements, and the document trail behind every filing.",
        description:
            "A shared workspace where clients can review invoices, download statements, and follow the document trail behind each filing without emailing back and forth.\n\nAccess is role based, and every change to a document is recorded with who made it and when, which keeps the audit trail straightforward.",
        category: "Digital Solutions",
        coverImage: coverPage("cover4.png"),
        images: ["/team-work.jpg", "/indian-building.jpg"],
        technologies: ["Next.js", "TypeScript", "PostgreSQL"],
        services: ["Digital Solutions", "Software Development"],
        completionDate: "2024-11-30T00:00:00.000Z",
        status: "Published",
        createdAt: "2024-09-16T00:00:00.000Z",
        updatedAt: "2024-11-30T00:00:00.000Z",
    },
    {
        _id: DEMO_PROJECT_IDS.portfolioExperience,
        title: "Interactive Portfolio Experience",
        shortDescription:
            "A personal portfolio that stages case studies as a scroll-driven story instead of a grid of links.",
        description:
            "A portfolio built around one continuous narrative: rather than a wall of thumbnails, the work is revealed as the visitor scrolls, with each project staged as its own scene.\n\nThe heavier artwork is preloaded in the background and the reveals are scrubbed against the scroll position, so the experience stays smooth on mid-range laptops and never blocks the page behind a loading screen.",
        category: "Digital Presence",
        coverImage: coverPage("cover5.png"),
        images: ["/HERO-SLIDE-IMAGES/IT-HERO.jpg", "/indian-programmer.jpg"],
        technologies: ["Next.js", "TypeScript", "GSAP", "Three.js"],
        services: ["Digital Presence", "Web Development"],
        completionDate: "2025-05-20T00:00:00.000Z",
        status: "Published",
        createdAt: "2025-03-27T00:00:00.000Z",
        updatedAt: "2025-05-20T00:00:00.000Z",
    },
];

const demoUpdates: Record<string, PortfolioUpdate[]> = {
    [DEMO_PROJECT_IDS.restaurantOrdering]: [
        {
            _id: "demo-update-restaurant-1",
            portfolioProjectId: DEMO_PROJECT_IDS.restaurantOrdering,
            title: "Kitchen view added",
            description:
                "The kitchen now gets a dedicated order queue with prep timers, separate from the customer-facing status updates.",
            date: "2025-02-18T00:00:00.000Z",
            images: ["/for-grocery-shop.jpg"],
            technologies: ["Next.js", "Node.js"],
            createdAt: "2025-02-18T00:00:00.000Z",
            updatedAt: "2025-02-18T00:00:00.000Z",
        },
    ],
    [DEMO_PROJECT_IDS.aiSupport]: [
        {
            _id: "demo-update-ai-1",
            portfolioProjectId: DEMO_PROJECT_IDS.aiSupport,
            title: "Answer citations",
            description:
                "Every generated answer now links back to the documentation it was drawn from, so support agents can verify it in one click.",
            date: "2025-04-09T00:00:00.000Z",
            technologies: ["Next.js", "Vector search"],
            createdAt: "2025-04-09T00:00:00.000Z",
            updatedAt: "2025-04-09T00:00:00.000Z",
        },
    ],
    [DEMO_PROJECT_IDS.portfolioExperience]: [
        {
            _id: "demo-update-portfolio-1",
            portfolioProjectId: DEMO_PROJECT_IDS.portfolioExperience,
            title: "Reduced-motion pass",
            description:
                "Every staged reveal now has a still fallback, so the story reads the same way for visitors who have motion disabled.",
            date: "2025-05-20T00:00:00.000Z",
            technologies: ["GSAP"],
            createdAt: "2025-05-20T00:00:00.000Z",
            updatedAt: "2025-05-20T00:00:00.000Z",
        },
    ],
};

/** Resolve a sample project (with its updates) by id, or null when unknown. */
export function demoProjectDetail(
    projectId: string,
): PortfolioProjectDetail | null {
    const project = demoProjects.find((item) => item._id === projectId);
    if (!project) return null;
    return { ...project, updates: demoUpdates[projectId] ?? [] };
}

