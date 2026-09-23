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

export const categories = [
    {
        slug: "websites",
        title: "Website & Web Development",
        shortDescription:
            "A professional website that brings you customers — fast, mobile-friendly, and easy to find on Google.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=70",
        alt: "Business owner reviewing a new website on a laptop",
        href: "/what-we-do#websites",
    },
    {
        slug: "mobile-apps",
        title: "Mobile Apps",
        shortDescription:
            "Simple, useful apps your customers actually enjoy using — on both iPhone and Android.",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=70",
        alt: "Customer using a business mobile app on a smartphone",
        href: "/what-we-do#mobile-apps",
    },
    {
        slug: "custom-software",
        title: "Custom Software",
        shortDescription:
            "Tools built around how your business works — bookings, billing, records, and systems that save hours every week.",
        image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=70",
        alt: "Small business team working with custom software",
        href: "/what-we-do#custom-software",
    },
    {
        slug: "ai-automation",
        title: "AI & Automation",
        shortDescription:
            "Practical AI that handles repetitive work — answering questions, following up, and keeping things moving.",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=70",
        alt: "Business dashboard showing automated workflows",
        href: "/what-we-do#ai-automation",
    },
    {
        slug: "online-presence",
        title: "Digital Marketing & Online Presence",
        shortDescription:
            "Get found, look great, and turn attention into enquiries — Google, social media, and content that works.",
        image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1200&q=70",
        alt: "Phone showing a business social media presence",
        href: "/what-we-do#online-presence",
    },
    {
        slug: "cloud-support",
        title: "Cloud, Hosting & IT Support",
        shortDescription:
            "Reliable hosting, secure systems, and friendly help when something needs fixing — so you never lose a day to tech problems.",
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=70",
        alt: "Support specialist helping a business with IT systems",
        href: "/what-we-do#cloud-support",
    },
];

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
