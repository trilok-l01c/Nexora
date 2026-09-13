export type PortfolioProjectStatus = "Draft" | "Published" | "Archived";

export type PortfolioProject = {
    _id: string;
    title: string;
    shortDescription: string;
    description?: string;
    category: string;
    coverImage?: string;
    images?: string[];
    technologies?: string[];
    services?: string[];
    projectUrl?: string;
    completionDate?: string;
    status: PortfolioProjectStatus;
    featured?: boolean;
    createdAt: string;
    updatedAt: string;
};

// Admin listing response shape (includes the update count per project).
export type PortfolioProjectWithStats = PortfolioProject & {
    updateCount: number;
};

export type PortfolioUpdate = {
    _id: string;
    portfolioProjectId: string;
    title: string;
    description: string;
    date: string;
    images?: string[];
    technologies?: string[];
    link?: string;
    createdAt: string;
    updatedAt: string;
};

// Public project detail response shape (project plus its updates).
export type PortfolioProjectDetail = PortfolioProject & {
    updates: PortfolioUpdate[];
};

export const PORTFOLIO_CATEGORIES: readonly string[] = [
    "Web Development",
    "Software Development",
    "Mobile Application",
    "AI & Automation",
    "Digital Solutions",
    "Digital Presence",
    "Social Media",
    "Other",
];

export const PORTFOLIO_STATUSES: readonly PortfolioProjectStatus[] = [
    "Draft",
    "Published",
    "Archived",
];

export function formatPortfolioDate(value: string) {
    return new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}
