"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAdminData, type WorkspaceSection } from "../AdminDataContext";
import { relativeTime, type Lead } from "../adminTypes";
import {
    Alert,
    Badge,
    EmptyState,
    LeadStatusBadge,
    ProgressBar,
    ProjectStatusBadge,
} from "../components/primitives";
import {
    ArrowRightIcon,
    CompaniesIcon,
    GridIcon,
    LeadsIcon,
    PortfolioIcon,
    ProjectsIcon,
    SupportIcon,
} from "../components/icons";
import styles from "../workspace.module.css";

export default function OverviewSection({
    onNavigate,
}: {
    onNavigate: (section: WorkspaceSection) => void;
}) {
    const {
        leads,
        projects,
        tickets,
        companies,
        loading,
        errors,
        loadLeads,
        loadProjects,
        loadTickets,
        loadCompanies,
    } = useAdminData();

    // Overview is a summary, so each resource is loaded once on arrival and then
    // shared with the section that owns the full management interface.
    useEffect(() => {
        if (leads.length === 0) void loadLeads("all").catch(() => undefined);
        if (projects.length === 0) void loadProjects().catch(() => undefined);
        if (tickets.length === 0) void loadTickets().catch(() => undefined);
        if (companies.length === 0) void loadCompanies().catch(() => undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stats = useMemo(() => {
        const newLeads = leads.filter((lead) => lead.status === "new").length;
        const inProgress = leads.filter(
            (lead) => lead.status === "in_progress",
        ).length;
        const activeProjects = projects.filter(
            (project) => project.status !== "Completed",
        ).length;
        const averageProgress =
            projects.length === 0
                ? 0
                : Math.round(
                      projects.reduce(
                          (total, project) => total + (project.progress || 0),
                          0,
                      ) / projects.length,
                  );
        const openTickets = tickets.filter(
            (ticket) => ticket.status !== "Resolved",
        ).length;
        const urgentTickets = tickets.filter(
            (ticket) =>
                ticket.priority === "Urgent" && ticket.status !== "Resolved",
        ).length;
        return {
            newLeads,
            inProgress,
            activeProjects,
            averageProgress,
            openTickets,
            urgentTickets,
            convertedLeads: leads.filter((lead) => lead.status === "completed")
                .length,
            companyCount: companies.length,
        };
    }, [leads, projects, tickets, companies]);

    const recentLeads = useMemo(
        () =>
            [...leads]
                .sort(
                    (left, right) =>
                        new Date(right.createdAt).getTime() -
                        new Date(left.createdAt).getTime(),
                )
                .slice(0, 5),
        [leads],
    );

    const recentProjects = useMemo(
        () =>
            [...projects]
                .sort(
                    (left, right) =>
                        new Date(right.updatedAt).getTime() -
                        new Date(left.updatedAt).getTime(),
                )
                .slice(0, 5),
        [projects],
    );

    const busy =
        loading.leads ||
        loading.projects ||
        loading.tickets ||
        loading.companies;
    const anyError =
        errors.leads || errors.projects || errors.tickets || errors.companies;

    // Greeting + sync stamp make the dashboard feel like a daily briefing.
    const hour = new Date().getHours();
    const greeting =
        hour < 12
            ? "Good morning"
            : hour < 17
              ? "Good afternoon"
              : "Good evening";
    const [lastSyncAt, setLastSyncAt] = useState(() => new Date());
    const lastSync = lastSyncAt.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });

    // Attention queue: everything actionable, worst first.
    const attention = useMemo(() => {
        const items: {
            key: string;
            tone: "red" | "amber" | "blue";
            text: ReactNode;
            section: WorkspaceSection;
        }[] = [];
        if (stats.urgentTickets > 0) {
            items.push({
                key: "urgent",
                tone: "red",
                text: (
                    <>
                        <strong>{stats.urgentTickets} urgent</strong>{" "}
                        {stats.urgentTickets === 1 ? "query is" : "queries are"}{" "}
                        waiting
                    </>
                ),
                section: "queries",
            });
        }
        if (stats.newLeads > 0) {
            items.push({
                key: "leads",
                tone: "blue",
                text: (
                    <>
                        <strong>{stats.newLeads} new</strong>{" "}
                        {stats.newLeads === 1 ? "lead has" : "leads have"} not
                        been contacted
                    </>
                ),
                section: "leads",
            });
        }
        if (stats.inProgress > 0) {
            items.push({
                key: "progress",
                tone: "amber",
                text: (
                    <>
                        <strong>{stats.inProgress}</strong>{" "}
                        {stats.inProgress === 1 ? "lead is" : "leads are"}{" "}
                        mid-conversation
                    </>
                ),
                section: "leads",
            });
        }
        const openTickets = stats.openTickets - stats.urgentTickets;
        if (openTickets > 0) {
            items.push({
                key: "queries",
                tone: "amber",
                text: (
                    <>
                        <strong>{openTickets} open</strong>{" "}
                        {openTickets === 1 ? "query needs" : "queries need"}{" "}
                        triage
                    </>
                ),
                section: "queries",
            });
        }
        return items.slice(0, 4);
    }, [stats]);

    const attentionTotal =
        stats.newLeads + stats.inProgress + stats.openTickets;

    return (
        <div className={styles.stack}>
            <header className={styles.pageHeader}>
                <div>
                    <p className={styles.pageKicker}>Daily briefing</p>
                    <h1 className={styles.pageTitle}>
                        {greeting}, welcome back
                    </h1>
                    <p className={styles.pageSubtitle}>
                        {attentionTotal === 0
                            ? "Everything is under control. Here is the state of the business."
                            : `${attentionTotal} ${attentionTotal === 1 ? "thing needs" : "things need"} your attention today.`}{" "}
                        Last synced {lastSync}.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={() => {
                            setLastSyncAt(new Date());
                            void loadLeads("all").catch(() => undefined);
                            void loadProjects().catch(() => undefined);
                            void loadTickets().catch(() => undefined);
                            void loadCompanies().catch(() => undefined);
                        }}
                        disabled={busy}
                    >
                        {busy ? "Refreshing..." : "Refresh summary"}
                    </button>
                </div>
            </header>

            {anyError ? <Alert tone="red">{anyError}</Alert> : null}

            <div className={styles.statGrid}>
                <StatCard
                    tone="green"
                    icon={<LeadsIcon />}
                    label="New leads"
                    value={stats.newLeads}
                    meta={`${stats.convertedLeads} converted to clients`}
                    onClick={() => onNavigate("leads")}
                />
                <StatCard
                    tone="blue"
                    icon={<ProjectsIcon />}
                    label="Active projects"
                    value={stats.activeProjects}
                    meta={`${projects.length} total · ${stats.averageProgress}% average progress`}
                    onClick={() => onNavigate("projects")}
                />
                <StatCard
                    tone="blue"
                    icon={<SupportIcon />}
                    label="Open queries"
                    value={stats.openTickets}
                    meta={
                        stats.urgentTickets
                            ? `${stats.urgentTickets} marked urgent`
                            : "No urgent queries"
                    }
                    onClick={() => onNavigate("queries")}
                />
                <StatCard
                    tone="green"
                    icon={<CompaniesIcon />}
                    label="Client companies"
                    value={stats.companyCount}
                    meta={`${stats.inProgress} leads in progress`}
                    onClick={() => onNavigate("clients")}
                />
            </div>

            <div className={styles.split}>
                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2 className={styles.panelTitle}>
                                Recent enquiries
                            </h2>
                            <p className={styles.panelHint}>
                                The five newest leads from the website contact
                                form.
                            </p>
                        </div>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                            onClick={() => onNavigate("leads")}
                        >
                            All leads
                            <ArrowRightIcon />
                        </button>
                    </div>
                    <div className={styles.panelBody}>
                        {recentLeads.length === 0 ? (
                            <EmptyState
                                title="No enquiries yet"
                                hint="New website enquiries will appear here as soon as they arrive."
                            />
                        ) : (
                            <ul className={styles.miniList}>
                                {recentLeads.map((lead) => (
                                    <RecentLeadRow
                                        key={lead._id}
                                        lead={lead}
                                        onClick={() => onNavigate("leads")}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2 className={styles.panelTitle}>
                                Project delivery
                            </h2>
                            <p className={styles.panelHint}>
                                Most recently updated client projects.
                            </p>
                        </div>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                            onClick={() => onNavigate("projects")}
                        >
                            All projects
                            <ArrowRightIcon />
                        </button>
                    </div>
                    <div className={styles.panelBody}>
                        {recentProjects.length === 0 ? (
                            <EmptyState
                                title="No projects yet"
                                hint="Projects appear once a lead is converted into a client."
                            />
                        ) : (
                            <ul className={styles.miniList}>
                                {recentProjects.map((project) => (
                                    <li
                                        className={styles.miniItem}
                                        key={project._id}
                                    >
                                        <div className={styles.miniItemMain}>
                                            <p className={styles.miniItemTitle}>
                                                {project.name}
                                            </p>
                                            <p className={styles.miniItemMeta}>
                                                {project.serviceType} · Updated{" "}
                                                {relativeTime(
                                                    project.updatedAt,
                                                )}
                                            </p>
                                        </div>
                                        <div className={styles.stackTight}>
                                            <ProjectStatusBadge
                                                status={project.status}
                                            />
                                            <ProgressBar
                                                value={project.progress}
                                                tone="blue"
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2 className={styles.panelTitle}>
                                Needs your attention
                            </h2>
                            <p className={styles.panelHint}>
                                The most urgent items across leads and support.
                                Select one to jump straight there.
                            </p>
                        </div>
                    </div>
                    <div className={styles.panelBody}>
                        {attention.length === 0 ? (
                            <EmptyState
                                title="All clear"
                                hint="No new leads, no waiting conversations, no open queries."
                                action={
                                    <button
                                        type="button"
                                        className={`${styles.btn} ${styles.btnPrimary}`}
                                        onClick={() => onNavigate("leads")}
                                    >
                                        Review leads
                                    </button>
                                }
                            />
                        ) : (
                            <div className={styles.noticeList}>
                                {attention.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        className={`${styles.noticeItem} ${styles.btn}`}
                                        style={{
                                            cursor: "pointer",
                                            textAlign: "left",
                                            width: "100%",
                                        }}
                                        onClick={() => onNavigate(item.section)}
                                    >
                                        <Badge tone={item.tone} dot>
                                            Action
                                        </Badge>{" "}
                                        {item.text}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2 className={styles.panelTitle}>
                                Workspace shortcuts
                            </h2>
                            <p className={styles.panelHint}>
                                Jump to the area you work in most.
                            </p>
                        </div>
                    </div>
                    <div className={styles.panelBody}>
                        <div className={styles.grid2}>
                            <Shortcut
                                icon={<GridIcon />}
                                label="Overview"
                                hint="This dashboard"
                                onClick={() => onNavigate("overview")}
                            />
                            <Shortcut
                                icon={<LeadsIcon />}
                                label="Leads"
                                hint="Enquiries and follow-ups"
                                onClick={() => onNavigate("leads")}
                            />
                            <Shortcut
                                icon={<SupportIcon />}
                                label="Queries & Support"
                                hint="Client support requests"
                                onClick={() => onNavigate("queries")}
                            />
                            <Shortcut
                                icon={<ProjectsIcon />}
                                label="Projects"
                                hint="Delivery, team, progress"
                                onClick={() => onNavigate("projects")}
                            />
                            <Shortcut
                                icon={<PortfolioIcon />}
                                label="Portfolio"
                                hint="Public showcase work"
                                onClick={() => onNavigate("portfolio")}
                            />
                            <Shortcut
                                icon={<CompaniesIcon />}
                                label="Clients & Companies"
                                hint="Accounts and contacts"
                                onClick={() => onNavigate("clients")}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function RecentLeadRow({ lead, onClick }: { lead: Lead; onClick: () => void }) {
    return (
        <li className={styles.miniItem}>
            <div className={styles.miniItemMain}>
                <p className={styles.miniItemTitle}>{lead.name}</p>
                <p className={styles.miniItemMeta}>
                    {lead.service}
                    {lead.company ? ` · ${lead.company}` : ""} ·{" "}
                    {relativeTime(lead.createdAt)}
                </p>
            </div>
            <div className={styles.btnRow}>
                <LeadStatusBadge status={lead.status} />
                <button
                    type="button"
                    className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                    onClick={onClick}
                    aria-label={`Open lead from ${lead.name}`}
                >
                    <ArrowRightIcon />
                </button>
            </div>
        </li>
    );
}

function StatCard({
    tone,
    icon,
    label,
    value,
    meta,
    onClick,
}: {
    tone: "green" | "blue";
    icon: ReactNode;
    label: string;
    value: number;
    meta: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className={`${styles.statCard} ${styles.statButton} ${
                tone === "green" ? styles.statCardGreen : ""
            }`}
            onClick={onClick}
        >
            <span className={styles.statTop}>
                <span className={styles.statIcon}>{icon}</span>
                <span className={styles.statLabel}>{label}</span>
            </span>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statMeta}>{meta}</span>
        </button>
    );
}

function Shortcut({
    icon,
    label,
    hint,
    onClick,
}: {
    icon: ReactNode;
    label: string;
    hint: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className={`${styles.miniItem} ${styles.btn}`}
            style={{ cursor: "pointer", textAlign: "left" }}
            onClick={onClick}
        >
            <span className={styles.statIcon}>{icon}</span>
            <span className={styles.miniItemMain}>
                <span className={styles.miniItemTitle}>{label}</span>
                <span className={styles.miniItemMeta}>{hint}</span>
            </span>
        </button>
    );
}
