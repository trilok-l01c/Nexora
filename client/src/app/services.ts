export type Service = {
    slug: string;
    title: string;
    category: string;
    shortDescription: string;
    headline: string;
    description: string;
    outcomes: string[];
    capabilities: string[];
};

export const serviceGroups: Record<"services" | "solutions", Service[]> = {
    services: [
        {
            slug: "software-development",
            title: "Software development",
            category: "Build",
            shortDescription: "Products engineered to move.",
            headline: "Software with a point of view.",
            description:
                "We design and build digital products that feel obvious to use and resilient under pressure, from an early prototype to a platform your whole business can rely on.",
            outcomes: [
                "Ship with confidence",
                "Scale without rewrites",
                "Create an experience people return to",
            ],
            capabilities: [
                "Web and mobile applications",
                "Product strategy and UX",
                "APIs and platform engineering",
                "Quality, observability, and ongoing delivery",
            ],
        },
        {
            slug: "cloud-infrastructure",
            title: "Cloud & infrastructure",
            category: "Enable",
            shortDescription: "A calmer foundation for growth.",
            headline: "Infrastructure that keeps its promises.",
            description:
                "We turn fragile environments into reliable systems with the security, visibility, and sensible automation teams need to move quickly.",
            outcomes: [
                "Reduce operational drag",
                "Make reliability visible",
                "Spend cloud budget with intention",
            ],
            capabilities: [
                "Cloud architecture and migration",
                "DevOps and platform automation",
                "Security and access foundations",
                "Monitoring, backup, and incident readiness",
            ],
        },
        {
            slug: "it-support-maintenance",
            title: "IT support & maintenance",
            category: "Care",
            shortDescription: "Thoughtful help for everyday technology.",
            headline: "Technology support that feels human.",
            description:
                "Your team should not lose a day to a preventable technology problem. We provide responsive support and maintenance that keeps work flowing.",
            outcomes: [
                "Resolve issues faster",
                "Protect productive time",
                "Keep systems healthy between projects",
            ],
            capabilities: [
                "Help desk and remote support",
                "Device and software management",
                "Preventive maintenance",
                "Documentation and team enablement",
            ],
        },
    ],
    solutions: [
        {
            slug: "ai-systems",
            title: "AI systems",
            category: "Multiply",
            shortDescription: "Practical intelligence for your team.",
            headline: "AI that earns its place.",
            description:
                "We find the useful edge of AI in your work, then turn it into secure, measurable tools that remove friction without removing judgment.",
            outcomes: [
                "Automate the repetitive",
                "Give teams better context",
                "Build trust into every workflow",
            ],
            capabilities: [
                "AI opportunity mapping",
                "Custom assistants and agents",
                "Knowledge search and retrieval",
                "Workflow automation and measurement",
            ],
        },
        {
            slug: "data-analysis",
            title: "Data analysis",
            category: "Understand",
            shortDescription: "Clear signals from complex data.",
            headline: "Turn data into direction.",
            description:
                "We bring scattered information into focus, so leaders can see what is changing, understand why, and make the next decision with more confidence.",
            outcomes: [
                "See the signal sooner",
                "Align teams around one truth",
                "Turn reporting into action",
            ],
            capabilities: [
                "Data strategy and modeling",
                "Dashboards and decision tools",
                "Customer and operational analysis",
                "Forecasting and performance measurement",
            ],
        },
        {
            slug: "digital-presence",
            title: "Digital presence",
            category: "Connect",
            shortDescription: "A presence people remember.",
            headline: "Make your best work impossible to miss.",
            description:
                "We shape digital experiences and content systems that give your brand a clear voice, a sharper point of view, and a reason to be remembered.",
            outcomes: [
                "Clarify what makes you different",
                "Show up consistently",
                "Turn attention into momentum",
            ],
            capabilities: [
                "Websites and campaign experiences",
                "Brand and content systems",
                "Social media operations",
                "Analytics and continuous improvement",
            ],
        },
    ],
};

export const allServices = [
    ...serviceGroups.services,
    ...serviceGroups.solutions,
];
