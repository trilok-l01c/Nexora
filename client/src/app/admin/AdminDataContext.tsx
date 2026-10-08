"use client";

// Shared server state for the admin workspace.
//
// The previous single-page dashboard owned leads, projects and homepage content
// in one component. Splitting the UI into tabs would otherwise re-fetch the same
// lists on every tab switch, so the data lives here once and each section reads
// only the slice it needs. Every call below uses the URLs, verbs and cookie
// credentials the dashboard already used.

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";
import { adminJson, adminRequest } from "./adminApi";
import {
    defaultHomeContent,
    normaliseHomeContent,
    type HomeContent,
} from "../homeContent";
import type {
    AdminProject,
    CompanyRosterEntry,
    Lead,
    LeadStatus,
    TeamMember,
    Ticket,
} from "./adminTypes";

type ApiResult<T> = { success: boolean; data: T; message?: string };

export type WorkspaceSection =
    | "overview"
    | "leads"
    | "queries"
    | "projects"
    | "portfolio"
    | "content"
    | "clients"
    | "account";

export const WORKSPACE_SECTIONS: readonly {
    key: WorkspaceSection;
    label: string;
    group: "Workspace" | "Delivery" | "Company";
}[] = [
    { key: "overview", label: "Overview", group: "Workspace" },
    { key: "leads", label: "Leads", group: "Workspace" },
    { key: "queries", label: "Queries & Support", group: "Workspace" },
    { key: "projects", label: "Projects", group: "Delivery" },
    { key: "portfolio", label: "Portfolio", group: "Delivery" },
    { key: "content", label: "Site Content", group: "Delivery" },
    { key: "clients", label: "Clients & Companies", group: "Company" },
    { key: "account", label: "Account & Settings", group: "Company" },
];

export type Resource = "leads" | "projects" | "tickets" | "companies" | "team";
export type ResourceKey = Resource | "home";

// `teamMembers` is written as raw user ids (that is what the model stores);
// reads come back populated, so the write type differs from the read type.
export type ProjectChanges = Partial<
    Pick<AdminProject, "status" | "progress" | "technologies">
> & {
    teamMembers?: string[];
};

type AdminDataValue = {
    leads: Lead[];
    projects: AdminProject[];
    tickets: Ticket[];
    companies: CompanyRosterEntry[];
    team: TeamMember[];
    homeContent: HomeContent;
    loading: Record<ResourceKey, boolean>;
    errors: Record<ResourceKey, string>;
    loadLeads: (status?: LeadStatus | "all") => Promise<Lead[]>;
    loadProjects: () => Promise<AdminProject[]>;
    loadTickets: () => Promise<Ticket[]>;
    loadCompanies: () => Promise<CompanyRosterEntry[]>;
    loadTeam: () => Promise<TeamMember[]>;
    loadHomeContent: () => Promise<void>;
    // Exposed as the raw state setter so editors can use functional updates
    // (updating one nested field without rebuilding the whole document).
    setHomeContent: Dispatch<SetStateAction<HomeContent>>;
    saveHomeContent: () => Promise<void>;
    updateProject: (
        id: string,
        changes: ProjectChanges,
    ) => Promise<AdminProject | null>;
};

const AdminDataContext = createContext<AdminDataValue | null>(null);

export function useAdminData() {
    const value = useContext(AdminDataContext);
    if (!value) {
        throw new Error("useAdminData must be used inside AdminDataProvider.");
    }
    return value;
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [projects, setProjects] = useState<AdminProject[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [companies, setCompanies] = useState<CompanyRosterEntry[]>([]);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [homeContent, setHomeContent] =
        useState<HomeContent>(defaultHomeContent);
    const [loading, setLoading] = useState<Record<ResourceKey, boolean>>({
        leads: false,
        projects: false,
        tickets: false,
        companies: false,
        team: false,
        home: false,
    });
    const [errors, setErrors] = useState<Record<ResourceKey, string>>({
        leads: "",
        projects: "",
        tickets: "",
        companies: "",
        team: "",
        home: "",
    });

    const start = useCallback((resource: ResourceKey) => {
        setLoading((current) => ({ ...current, [resource]: true }));
        setErrors((current) => ({ ...current, [resource]: "" }));
    }, []);

    const finish = useCallback((resource: ResourceKey) => {
        setLoading((current) => ({ ...current, [resource]: false }));
    }, []);

    const fail = useCallback((resource: ResourceKey, error: unknown) => {
        setLoading((current) => ({ ...current, [resource]: false }));
        setErrors((current) => ({
            ...current,
            [resource]:
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Try again.",
        }));
    }, []);

    const loadLeads = useCallback(
        async (status: LeadStatus | "all" = "all") => {
            start("leads");
            try {
                const query = status === "all" ? "" : `?status=${status}`;
                const result = await adminRequest<ApiResult<Lead[]>>(
                    `/api/admin/leads${query}`,
                );
                setLeads(result.data);
                finish("leads");
                return result.data;
            } catch (error) {
                fail("leads", error);
                throw error;
            }
        },
        [start, finish, fail],
    );

    const loadProjects = useCallback(async () => {
        start("projects");
        try {
            const result = await adminRequest<ApiResult<AdminProject[]>>(
                "/api/admin/projects",
            );
            setProjects(result.data);
            finish("projects");
            return result.data;
        } catch (error) {
            fail("projects", error);
            throw error;
        }
    }, [start, finish, fail]);

    const loadTickets = useCallback(async () => {
        start("tickets");
        try {
            const result = await adminRequest<ApiResult<Ticket[]>>(
                "/api/admin/tickets",
            );
            setTickets(result.data);
            finish("tickets");
            return result.data;
        } catch (error) {
            fail("tickets", error);
            throw error;
        }
    }, [start, finish, fail]);

    const loadCompanies = useCallback(async () => {
        start("companies");
        try {
            const result = await adminRequest<ApiResult<CompanyRosterEntry[]>>(
                "/api/admin/companies",
            );
            setCompanies(result.data);
            finish("companies");
            return result.data;
        } catch (error) {
            fail("companies", error);
            throw error;
        }
    }, [start, finish, fail]);

    const loadTeam = useCallback(async () => {
        start("team");
        try {
            const result = await adminRequest<ApiResult<TeamMember[]>>(
                "/api/admin/team",
            );
            setTeam(result.data);
            finish("team");
            return result.data;
        } catch (error) {
            fail("team", error);
            throw error;
        }
    }, [start, finish, fail]);

    const loadHomeContent = useCallback(async () => {
        start("home");
        try {
            const result = await adminRequest<ApiResult<Partial<HomeContent>>>(
                "/api/admin/home",
            );
            // Legacy homepage documents used a different layout. Normalising
            // here safely falls back to the current page's editable sections.
            setHomeContent(normaliseHomeContent(result.data));
            finish("home");
        } catch (error) {
            fail("home", error);
            throw error;
        }
    }, [start, finish, fail]);

    const saveHomeContent = useCallback(async () => {
        start("home");
        try {
            const result = await adminJson<ApiResult<HomeContent>>(
                "/api/admin/home",
                "PATCH",
                { content: homeContent },
            );
            setHomeContent(result.data);
            finish("home");
        } catch (error) {
            fail("home", error);
            throw error;
        }
    }, [homeContent, start, finish, fail]);

    const updateProject = useCallback<AdminDataValue["updateProject"]>(
        async (id, changes) => {
            try {
                const result = await adminJson<ApiResult<AdminProject>>(
                    `/api/admin/projects/${id}`,
                    "PATCH",
                    changes,
                );
                setProjects((current) =>
                    current.map((project) =>
                        project._id === id ? result.data : project,
                    ),
                );
                return result.data;
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Could not update the project.";
                setErrors((current) => ({ ...current, projects: message }));
                throw new Error(message);
            }
        },
        [],
    );

    const value = useMemo<AdminDataValue>(
        () => ({
            leads,
            projects,
            tickets,
            companies,
            team,
            homeContent,
            loading,
            errors,
            loadLeads,
            loadProjects,
            loadTickets,
            loadCompanies,
            loadTeam,
            loadHomeContent,
            setHomeContent,
            saveHomeContent,
            updateProject,
        }),
        [
            leads,
            projects,
            tickets,
            companies,
            team,
            homeContent,
            loading,
            errors,
            loadLeads,
            loadProjects,
            loadTickets,
            loadCompanies,
            loadTeam,
            loadHomeContent,
            saveHomeContent,
            updateProject,
        ],
    );

    return (
        <AdminDataContext.Provider value={value}>
            {children}
        </AdminDataContext.Provider>
    );
}
