"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import Link from "next/link";
import { useClientAuth } from "../client/ClientAuthContext";
import {
    useAdminData,
    WORKSPACE_SECTIONS,
    type WorkspaceSection,
} from "./AdminDataContext";
import {
    CompaniesIcon,
    ContentIcon,
    GridIcon,
    LeadsIcon,
    MenuIcon,
    PortfolioIcon,
    ProjectsIcon,
    SearchIcon,
    SettingsIcon,
    SupportIcon,
    CloseIcon,
} from "./components/icons";
import AccountSection from "./sections/AccountSection";
import ClientsSection from "./sections/ClientsSection";
import LeadsSection from "./sections/LeadsSection";
import OverviewSection from "./sections/OverviewSection";
import PortfolioSection from "./sections/PortfolioSection";
import ProjectsSection from "./sections/ProjectsSection";
import QueriesSection from "./sections/QueriesSection";
import SiteContentSection from "./sections/SiteContentSection";
import styles from "./workspace.module.css";

const SECTION_ICONS: Record<WorkspaceSection, ReactNode> = {
    overview: <GridIcon />,
    leads: <LeadsIcon />,
    queries: <SupportIcon />,
    projects: <ProjectsIcon />,
    portfolio: <PortfolioIcon />,
    content: <ContentIcon />,
    clients: <CompaniesIcon />,
    account: <SettingsIcon />,
};

function readHashSection(): WorkspaceSection {
    if (typeof window === "undefined") return "overview";
    const fromHash = window.location.hash.replace("#", "");
    return WORKSPACE_SECTIONS.some((entry) => entry.key === fromHash)
        ? (fromHash as WorkspaceSection)
        : "overview";
}

export default function AdminWorkspace({
    onSignOut,
}: {
    onSignOut: () => void;
}) {
    const {
        leads,
        tickets,
        projects,
        loadTickets,
    } = useAdminData();
    const { user } = useClientAuth();
    // The active tab is mirrored into the URL hash so a refresh, or a shared
    // link, lands on the same tab instead of always resetting to Overview.
    // Read lazily during the initial render rather than in an effect.
    const [section, setSection] = useState<WorkspaceSection>(readHashSection);
    const [drawerOpen, setDrawerOpen] = useState(false);

    function navigate(next: WorkspaceSection) {
        setSection(next);
        setDrawerOpen(false);
        window.history.replaceState(null, "", `#${next}`);
    }

    // Alt+1..8 jumps between sections; "/" focuses the workspace search.
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const typing =
                target &&
                (target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.tagName === "SELECT" ||
                    target.isContentEditable);
            if (event.key === "/" && !typing && !event.altKey && !event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                document
                    .querySelector<HTMLInputElement>("[data-workspace-search]")
                    ?.focus();
                return;
            }
            if (event.altKey && !event.ctrlKey && !event.metaKey) {
                const index = Number.parseInt(event.key, 10);
                if (index >= 1 && index <= WORKSPACE_SECTIONS.length) {
                    event.preventDefault();
                    navigate(WORKSPACE_SECTIONS[index - 1].key);
                }
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    // Support queries drive the sidebar badge, so they are kept warm once the
    // workspace has loaded.
    useEffect(() => {
        if (tickets.length === 0) void loadTickets().catch(() => undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const counts = useMemo(() => {
        const newLeads = leads.filter((lead) => lead.status === "new").length;
        const openTickets = tickets.filter(
            (ticket) => ticket.status !== "Resolved",
        ).length;
        const activeProjects = projects.filter(
            (project) => project.status !== "Completed",
        ).length;
        return { newLeads, openTickets, activeProjects };
    }, [leads, tickets, projects]);

    const badgeFor = (key: WorkspaceSection) => {
        if (key === "leads" && counts.newLeads > 0) {
            return { value: counts.newLeads, alert: true };
        }
        if (key === "queries" && counts.openTickets > 0) {
            return { value: counts.openTickets, alert: false };
        }
        if (key === "projects" && counts.activeProjects > 0) {
            return { value: counts.activeProjects, alert: false };
        }
        return null;
    };

    const activeLabel =
        WORKSPACE_SECTIONS.find((entry) => entry.key === section)?.label ??
        "Overview";

    return (
        <div className={styles.workspace}>
            <aside className={styles.sidebar}>
                <Link className={styles.sidebarBrand} href="/">
                    <span className={styles.brandMark}>N</span>
                    <span className={styles.brandText}>
                        Nexora
                        <small>Admin workspace</small>
                    </span>
                </Link>
                <SidebarNav
                    section={section}
                    badgeFor={badgeFor}
                    onNavigate={navigate}
                />
                <SidebarFooter onSignOut={onSignOut} />
            </aside>

            {drawerOpen ? (
                <>
                    <div
                        className={styles.scrim}
                        role="presentation"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div className={styles.drawer} role="dialog" aria-label="Workspace navigation">
                        <Link
                            className={styles.sidebarBrand}
                            href="/"
                            onClick={() => setDrawerOpen(false)}
                        >
                            <span className={styles.brandMark}>N</span>
                            <span className={styles.brandText}>
                                Nexora
                                <small>Admin workspace</small>
                            </span>
                        </Link>
                        <button
                            type="button"
                            className={`${styles.iconButton} ${styles.drawerClose}`}
                            onClick={() => setDrawerOpen(false)}
                            aria-label="Close navigation"
                        >
                            <CloseIcon />
                        </button>
                        <SidebarNav
                            section={section}
                            badgeFor={badgeFor}
                            onNavigate={navigate}
                        />
                        <SidebarFooter onSignOut={onSignOut} />
                    </div>
                </>
            ) : null}

            <div className={styles.main}>
                <div className={styles.mobileBar}>
                    <button
                        type="button"
                        className={styles.menuButton}
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Open navigation"
                        aria-expanded={drawerOpen}
                    >
                        <MenuIcon />
                    </button>
                    <span className={styles.mobileTitle}>{activeLabel}</span>
                </div>

                <div className={styles.topbar}>
                    <div className={styles.topbarText}>
                        <p className={styles.topbarTitle}>{activeLabel}</p>
                        <p className={styles.topbarMeta}>
                            Signed in as {user?.email || "admin"}
                        </p>
                    </div>
                    <div className={styles.topbarActions}>
                        <WorkspaceSearch onNavigate={navigate} />
                        <Link
                            className={`${styles.btn} ${styles.btnGhost}`}
                            href="/"
                        >
                            View site
                        </Link>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={onSignOut}
                        >
                            Sign out
                        </button>
                    </div>
                </div>

                <main className={styles.content}>
                    <div className={styles.contentInner}>
                        <SectionRouter
                            section={section}
                            onNavigate={navigate}
                            onSignOut={onSignOut}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}

function SidebarNav({
    section,
    badgeFor,
    onNavigate,
}: {
    section: WorkspaceSection;
    badgeFor: (key: WorkspaceSection) => { value: number; alert: boolean } | null;
    onNavigate: (next: WorkspaceSection) => void;
}) {
    const groups = ["Workspace", "Delivery", "Company"] as const;
    return (
        <nav className={styles.nav} aria-label="Workspace sections">
            {groups.map((group) => (
                <div key={group}>
                    <p className={styles.navLabel}>{group}</p>
                    {WORKSPACE_SECTIONS.filter(
                        (entry) => entry.group === group,
                    ).map((entry) => {
                        const badge = badgeFor(entry.key);
                        const active = entry.key === section;
                        return (
                            <button
                                key={entry.key}
                                type="button"
                                className={`${styles.navItem} ${
                                    active ? styles.navItemActive : ""
                                }`}
                                aria-current={active ? "page" : undefined}
                                onClick={() => onNavigate(entry.key)}
                            >
                                <span className={styles.navIcon}>
                                    {SECTION_ICONS[entry.key]}
                                </span>
                                <span>{entry.label}</span>
                                {badge ? (
                                    <span
                                        className={`${styles.navCount} ${
                                            badge.alert
                                                ? styles.navCountAlert
                                                : ""
                                        }`}
                                    >
                                        {badge.value}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            ))}
        </nav>
    );
}

function SidebarFooter({ onSignOut }: { onSignOut: () => void }) {
    const { user } = useClientAuth();
    return (
        <div className={styles.sidebarFooter}>
            <div className={styles.sidebarUser}>
                <span className={styles.avatar}>
                    {(user?.email || "N").slice(0, 2)}
                </span>
                <span className={styles.sidebarUserText}>
                    <strong>{user?.email || "Admin"}</strong>
                    <span>
                        {user?.role === "admin" ? "Administrator" : "Staff"}
                    </span>
                </span>
            </div>
            <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                style={{ width: "100%" }}
                onClick={onSignOut}
            >
                Sign out
            </button>
        </div>
    );
}

/* Working global search across leads, tickets, projects, and companies. */

type SearchHit = {
    key: string;
    section: WorkspaceSection;
    icon: ReactNode;
    title: string;
    meta: string;
};

function collectSearchHits(
    query: string,
    data: {
        leads: ReturnType<typeof useAdminData>["leads"];
        tickets: ReturnType<typeof useAdminData>["tickets"];
        projects: ReturnType<typeof useAdminData>["projects"];
        companies: ReturnType<typeof useAdminData>["companies"];
    },
): SearchHit[] {
    const hits: SearchHit[] = [];
    const matches = (values: unknown[]) =>
        values
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
    for (const lead of data.leads) {
        if (matches([lead.name, lead.email, lead.company, lead.service])) {
            hits.push({
                key: `lead-${lead._id}`,
                section: "leads",
                icon: <LeadsIcon size={15} />,
                title: lead.name,
                meta: `Lead · ${lead.service}${lead.company ? ` · ${lead.company}` : ""}`,
            });
        }
        if (hits.length >= 3) break;
    }
    for (const ticket of data.tickets) {
        if (matches([ticket.subject, ticket.companyId?.name, ticket.createdBy?.email])) {
            hits.push({
                key: `ticket-${ticket._id}`,
                section: "queries",
                icon: <SupportIcon size={15} />,
                title: ticket.subject,
                meta: `Support · ${ticket.companyId?.name || "Client"} · ${ticket.status}`,
            });
        }
        if (hits.length >= 6) break;
    }
    for (const project of data.projects) {
        if (matches([project.name, project.serviceType])) {
            hits.push({
                key: `project-${project._id}`,
                section: "projects",
                icon: <ProjectsIcon size={15} />,
                title: project.name,
                meta: `Project · ${project.status} · ${project.progress}%`,
            });
        }
        if (hits.length >= 9) break;
    }
    for (const company of data.companies) {
        if (matches([company.name, company.slug])) {
            hits.push({
                key: `company-${company._id}`,
                section: "clients",
                icon: <CompaniesIcon size={15} />,
                title: company.name,
                meta: `Company · ${company.projectCount} projects · ${company.clientCount} contacts`,
            });
        }
        if (hits.length >= 12) break;
    }
    return hits.slice(0, 8);
}

function WorkspaceSearch({
    onNavigate,
}: {
    onNavigate: (next: WorkspaceSection) => void;
}) {
    const { leads, tickets, projects, companies } = useAdminData();
    const [term, setTerm] = useState("");
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const results = useMemo(() => {
        const query = term.trim().toLowerCase();
        if (query.length < 2) return [];
        return collectSearchHits(query, { leads, tickets, projects, companies });
    }, [term, leads, tickets, projects, companies]);

    function go(hit: SearchHit) {
        setOpen(false);
        setTerm("");
        onNavigate(hit.section);
    }

    return (
        <div className={styles.workspaceSearch} ref={rootRef}>
            <SearchIcon />
            <input
                type="search"
                value={term}
                data-workspace-search
                placeholder="Search leads, clients, projects"
                aria-label="Search workspace"
                onChange={(event) => {
                    setTerm(event.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={(event) => {
                    if (event.key === "Enter" && results.length > 0) {
                        (event.target as HTMLInputElement).blur();
                        go(results[0]);
                    }
                    if (event.key === "Escape") setOpen(false);
                }}
            />
            <span className={styles.searchKbd}>/</span>
            {open && term.trim().length >= 2 ? (
                <div className={styles.searchResults} role="listbox" aria-label="Search results">
                    {results.length === 0 ? (
                        <p className={styles.searchResultsEmpty}>
                            No matches. Try a name, company, or project.
                        </p>
                    ) : (
                        <ul className={styles.searchResultsList}>
                            {results.map((hit) => (
                                <li key={hit.key}>
                                    <button
                                        type="button"
                                        className={styles.searchResultsItem}
                                        onClick={() => go(hit)}
                                    >
                                        <span className={styles.searchResultsIcon}>
                                            {hit.icon}
                                        </span>
                                        <span className={styles.searchResultsText}>
                                            <strong>{hit.title}</strong>
                                            <span>{hit.meta}</span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : null}
        </div>
    );
}

function SectionRouter({
    section,
    onNavigate,
    onSignOut,
}: {
    section: WorkspaceSection;
    onNavigate: (next: WorkspaceSection) => void;
    onSignOut: () => void;
}) {
    switch (section) {
        case "leads":
            return <LeadsSection />;
        case "queries":
            return <QueriesSection />;
        case "projects":
            return <ProjectsSection />;
        case "portfolio":
            return <PortfolioSection />;
        case "content":
            return <SiteContentSection />;
        case "clients":
            return <ClientsSection />;
        case "account":
            return <AccountSection onSignOut={onSignOut} />;
        case "overview":
        default:
            return <OverviewSection onNavigate={onNavigate} />;
    }
}
