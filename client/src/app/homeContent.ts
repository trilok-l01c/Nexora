export type HomeContent = {
    heroSlides: { image: string; alt: string; phrase: string }[];
    intro: { kicker: string; title: string; emphasis: string; text: string };
    services: { title: string; text: string; image: string; alt: string }[];
    story: { kicker: string; title: string; emphasis: string; text: string; image: string; imageAlt: string; linkLabel: string };
    work: { kicker: string; title: string; linkLabel: string; primary: ContentFeature; secondary: ContentFeature };
    reasons: { kicker: string; items: { title: string; text: string }[] };
};

type ContentFeature = { label: string; title: string; image: string; alt: string };

export const defaultHomeContent: HomeContent = {
    heroSlides: [
        { image: "/HERO-SLIDE-IMAGES/ACCOUNT-HERO.jpg", alt: "Client portal dashboard for local Indian businesses", phrase: "choose" },
        { image: "/HERO-SLIDE-IMAGES/AI-HERO.jpg", alt: "AI automation for Indian small businesses", phrase: "grow" },
        { image: "/HERO-SLIDE-IMAGES/GARAGE-HERO.jpg", alt: "Local garage workshop with digital management", phrase: "run" },
        { image: "/HERO-SLIDE-IMAGES/IT-HERO.jpg", alt: "IT support for local Indian businesses", phrase: "trust" },
        { image: "/HERO-SLIDE-IMAGES/RESTO-HERO.jpg", alt: "Restaurant digital presence solutions", phrase: "attract" },
    ],
    intro: { kicker: "What Nexora brings to the table", title: "Technology should feel like a", emphasis: "good business decision.", text: "We turn a business need into a useful digital experience—without making you learn a new language first." },
    services: [
        { title: "Websites that bring in enquiries", text: "A clear, credible home for your business—fast on every screen and easy to update.", image: "/Home-page-services/WEBSITE.png", alt: "Restaurant website with an online table-booking button" },
        { title: "Apps that keep customers close", text: "Make booking, ordering, updates, and everyday service feel effortless.", image: "/Home-page-services/APPS.jpg", alt: "Smartphone home screen filled with mobile app icons" },
        { title: "Systems that save your team time", text: "Replace scattered spreadsheets and repetitive tasks with a simpler way to work.", image: "/Home-page-services/AI.jpg", alt: "AI assistant on a screen listing what it can do" },
    ],
    story: { kicker: "A partner, not a jargon machine", title: "We start with your day-to-day, then make it", emphasis: "work better.", text: "Whether you need a stronger first impression, a smoother customer journey, or a system behind the scenes, we keep the process straightforward and focused on what matters.", image: "/team-work.jpg", imageAlt: "Team discussing a project together", linkLabel: "Meet Nexora" },
    work: { kicker: "Ideas made real", title: "Work with a purpose, not just a pretty screen.", linkLabel: "View our work", primary: { label: "Digital solutions", title: "Better experiences begin with a better plan.", image: "/health-tech.jpg", alt: "Healthcare technology workspace" }, secondary: { label: "Local business", title: "Everyday business, made easier.", image: "/for-grocery-shop.jpg", alt: "Local grocery shop" } },
    reasons: { kicker: "Why businesses choose Nexora", items: [
        { title: "Business-first thinking", text: "We speak in outcomes, not technical acronyms." },
        { title: "One connected team", text: "Strategy, design, build, and support work together." },
        { title: "Built to be useful", text: "Every decision earns its place in your business." },
    ] },
};

export function normaliseHomeContent(content: Partial<HomeContent> | null | undefined): HomeContent {
    const source = content ?? {};
    return {
        heroSlides: Array.isArray(source.heroSlides) && source.heroSlides.length ? source.heroSlides : defaultHomeContent.heroSlides,
        intro: { ...defaultHomeContent.intro, ...(source.intro ?? {}) },
        services: Array.isArray(source.services) && source.services.length ? source.services : defaultHomeContent.services,
        story: { ...defaultHomeContent.story, ...(source.story ?? {}) },
        work: { ...defaultHomeContent.work, ...(source.work ?? {}), primary: { ...defaultHomeContent.work.primary, ...(source.work?.primary ?? {}) }, secondary: { ...defaultHomeContent.work.secondary, ...(source.work?.secondary ?? {}) } },
        reasons: { ...defaultHomeContent.reasons, ...(source.reasons ?? {}), items: Array.isArray(source.reasons?.items) && source.reasons.items.length ? source.reasons.items : defaultHomeContent.reasons.items },
    };
}
