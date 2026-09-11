export type HomeContent = {
    hero: {
        eyebrow: string;
        title: string;
        titleEmphasis: string;
        titleSuffix: string;
        text: string;
    };
    ticker: string[];
    solutions: {
        number: string;
        label: string;
        title: string;
        titleSecondLine: string;
        text: string;
        href: string;
        link: string;
        featured?: boolean;
    }[];
    industries: {
        number: string;
        name: string;
        title: string;
        text: string;
        outcomes: string;
    }[];
    approach: {
        meta: string;
        metaSecondLine: string;
        title: string;
        titleSecondLine: string;
        titleEmphasis: string;
        text: string;
        linkLabel: string;
    };
    stats: { value: string; label: string; detail: string }[];
};

export const defaultHomeContent: HomeContent = {
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
    solutions: [
        {
            number: "01",
            label: "Build",
            title: "Digital products",
            titleSecondLine: "with a pulse.",
            text: "End-to-end web and mobile products engineered for speed, scale, and the people using them.",
            href: "/services/software-development",
            link: "See how we build",
            featured: true,
        },
        {
            number: "02",
            label: "Multiply",
            title: "AI that works",
            titleSecondLine: "for your team.",
            text: "AI agents and practical integrations that remove friction and create room for better work.",
            href: "/services/ai-systems",
            link: "Explore AI systems",
        },
        {
            number: "03",
            label: "Understand",
            title: "Data into",
            titleSecondLine: "direction.",
            text: "Data analysis and clear decision tools that reveal what is happening and what to do next.",
            href: "/services/data-analysis",
            link: "Find your signal",
        },
        {
            number: "04",
            label: "Connect",
            title: "Presence that",
            titleSecondLine: "gets noticed.",
            text: "Social media management and content systems that make your brand impossible to scroll past.",
            href: "/services/digital-presence",
            link: "Shape your story",
        },
    ],
    industries: [
        {
            number: "01",
            name: "Hospitals & healthcare",
            title: "Better care starts with clearer systems.",
            text: "Connect patient information, simplify staff workflows, and give healthcare teams the reliable tools they need to spend more time caring.",
            outcomes:
                "Patient portals · Operations dashboards · Secure infrastructure",
        },
        {
            number: "02",
            name: "Restaurants & hospitality",
            title: "Make every service run smoother.",
            text: "From online ordering to stock visibility, we help hospitality teams reduce friction for staff and create more memorable guest experiences.",
            outcomes: "Ordering systems · Inventory tools · Digital presence",
        },
        {
            number: "03",
            name: "Schools & education",
            title: "Give learning more room to happen.",
            text: "Bring students, parents, teachers, and administrators into simpler digital experiences that make communication and progress easier to manage.",
            outcomes:
                "Learning platforms · Parent communication · Data reporting",
        },
        {
            number: "04",
            name: "Supermarkets & retail",
            title: "Turn busy operations into useful insight.",
            text: "See what is selling, keep shelves moving, and make the customer journey more convenient across stores and digital channels.",
            outcomes:
                "Stock analytics · Customer experiences · Workflow automation",
        },
        {
            number: "05",
            name: "Professional services",
            title: "Make expertise easier to deliver.",
            text: "We help firms organize knowledge, automate repeatable work, and build digital touchpoints that earn client confidence.",
            outcomes: "Client portals · AI assistants · Process automation",
        },
        {
            number: "06",
            name: "Logistics & operations",
            title: "Keep decisions moving with the work.",
            text: "Connect teams, assets, and data so operational leaders can respond faster and plan with a clearer view of what is happening.",
            outcomes: "Tracking tools · Performance dashboards · Cloud systems",
        },
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
