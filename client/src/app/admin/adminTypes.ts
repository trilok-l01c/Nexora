// Shared shapes for the admin workspace. These mirror the JSON the existing
// `/api/admin/*` endpoints already return; nothing here changes the API.

export type LeadStatus =
    | "new"
    | "contacted"
    | "in_progress"
    | "completed"
    | "rejected";

export type LeadNoteType = "note" | "status" | "converted";

export type LeadNote = {
    _id: string;
    text: string;
    type: LeadNoteType;
    authorName?: string;
    createdAt: string;
};

export type Lead = {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    service: string;
    message: string;
    source: string;
    status: LeadStatus;
    notes?: LeadNote[];
    convertedCompanyId?: string;
    convertedUserId?: string;
    convertedAt?: string;
    createdAt: string;
    updatedAt: string;
};

export const LEAD_STATUSES: readonly LeadStatus[] = [
    "new",
    "contacted",
    "in_progress",
    "completed",
    "rejected",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
    new: "New",
    contacted: "Contacted",
    in_progress: "In progress",
    completed: "Converted",
    rejected: "Lost",
};

// `completed` means "converted to client" and is only reachable through the
// conversion endpoint, so it is deliberately absent from the manual picker.
export const MANUAL_LEAD_STATUSES: readonly LeadStatus[] = [
    "new",
    "contacted",
    "in_progress",
    "rejected",
];

export const PROJECT_STATUSES: readonly string[] = [
    "Requested",
    "Pending Review",
    "Planning",
    "Design",
    "Development",
    "Testing",
    "Review",
    "Deployment",
    "Completed",
    "On Hold",
];

export type ProjectTeamMember = {
    _id: string;
    name?: string;
    email?: string;
    professionalTitle?: string;
    professionalBio?: string;
    avatarUrl?: string;
};

export type ProjectTechnologyGroup = {
    category: string;
    items: string[];
};

export type ProjectMilestone = {
    name: string;
    status: "completed" | "current" | "upcoming";
    order: number;
};

export type ProjectUpdate = {
    _id: string;
    title: string;
    description: string;
    category: string;
    author?: ProjectTeamMember;
    createdAt: string;
    updatedAt: string;
};

export type ProjectActivity = {
    _id: string;
    text: string;
    actor?: ProjectTeamMember;
    createdAt: string;
};

export type AdminProject = {
    _id: string;
    companyId: string;
    name: string;
    description: string;
    requirements?: string;
    serviceType: string;
    preferredStartDate?: string;
    expectedBudget?: string;
    status: string;
    progress: number;
    startDate?: string;
    expectedEndDate?: string;
    teamMembers: ProjectTeamMember[];
    technologies: ProjectTechnologyGroup[];
    milestones: ProjectMilestone[];
    updates: ProjectUpdate[];
    activity: ProjectActivity[];
    createdAt: string;
    updatedAt: string;
};

export type TeamMember = {
    _id: string;
    name?: string;
    email: string;
    role: string;
    professionalTitle?: string;
    professionalBio?: string;
    avatarUrl?: string;
};

export type TicketStatus = "Open" | "In Progress" | "Resolved";
export type TicketPriority = "Low" | "Normal" | "High" | "Urgent";

export const TICKET_STATUSES: readonly TicketStatus[] = [
    "Open",
    "In Progress",
    "Resolved",
];

export const TICKET_PRIORITIES: readonly TicketPriority[] = [
    "Low",
    "Normal",
    "High",
    "Urgent",
];

export type Ticket = {
    _id: string;
    number: number;
    companyId: { _id: string; name: string; slug: string };
    projectId?: { _id: string; name: string; status: string };
    createdBy: { _id: string; name?: string; email: string };
    subject: string;
    description: string;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
};

export type CompanyClient = {
    _id: string;
    name?: string;
    email: string;
    phone?: string;
    role: string;
    createdAt: string;
};

export type CompanyProject = {
    _id: string;
    name: string;
    status: string;
    progress: number;
    updatedAt: string;
};

export type CompanyRosterEntry = {
    _id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    latestActivityAt: string;
    clientCount: number;
    projectCount: number;
    activeProjectCount: number;
    clients: CompanyClient[];
    projects: CompanyProject[];
};

export function formatDate(value?: string | null) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function formatDateTime(value?: string | null) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function relativeTime(value?: string | null) {
    if (!value) return "";
    const time = new Date(value).getTime();
    if (Number.isNaN(time)) return "";
    const seconds = Math.round((Date.now() - time) / 1000);
    const units: [number, Intl.RelativeTimeFormatUnit][] = [
        [60, "second"],
        [60, "minute"],
        [24, "hour"],
        [7, "day"],
        [4.35, "week"],
        [12, "month"],
    ];
    let amount = -seconds;
    for (const [size, unit] of units) {
        if (Math.abs(amount) < size) {
            return new Intl.RelativeTimeFormat("en-GB", {
                numeric: "auto",
            }).format(Math.round(amount), unit);
        }
        amount /= size;
    }
    return new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" }).format(
        Math.round(amount),
        "year",
    );
}