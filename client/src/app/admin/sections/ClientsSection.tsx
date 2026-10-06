"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminData } from "../AdminDataContext";
import { formatDate, relativeTime, type CompanyRosterEntry } from "../adminTypes";
import {
    Alert,
    Badge,
    EmptyState,
    ProjectStatusBadge,
} from "../components/primitives";
import { SearchIcon } from "../components/icons";
import styles from "../workspace.module.css";

export default function ClientsSection() {
    const { companies, loadCompanies, loading, errors } = useAdminData();
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (companies.length === 0) {
            void loadCompanies().catch(() => undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return companies;
        return companies.filter((company) =>
            [
                company.name,
                company.slug,
                ...company.clients.map((client) => client.email),
                ...company.clients.map((client) => client.name),
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term)),
        );
    }, [companies, query]);

    const selected = useMemo(
        () => companies.find((company) => company._id === selectedId) ?? null,
        [companies, selectedId],
    );

    const totalClients = companies.reduce(
        (total, company) => total + company.clientCount,
        0,
    );

    return (
        <div className={styles.stack}>
            <header className={styles.pageHeader}>
                <div>
                    <p className={styles.pageKicker}>Accounts</p>
                    <h1 className={styles.pageTitle}>Clients &amp; Companies</h1>
                    <p className={styles.pageSubtitle}>
                        Every company with a Nexora portal account, the people
                        who can sign in, and the projects they have with us.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <span className={styles.badge}>
                        {companies.length} companies
                    </span>
                    <span className={styles.badge}>{totalClients} contacts</span>
                </div>
            </header>

            {errors.companies ? (
                <Alert tone="red">{errors.companies}</Alert>
            ) : null}

            <section className={styles.panel}>
                <div className={styles.toolbar}>
                    <div className={styles.searchField}>
                        <span className={styles.searchIcon}>
                            <SearchIcon />
                        </span>
                        <input
                            className={styles.input}
                            type="search"
                            value={query}
                            placeholder="Search company or contact…"
                            aria-label="Search companies"
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                    {loading.companies ? (
                        <span
                            className={`${styles.spinnerText} ${styles.toolbarEnd}`}
                        >
                            Loading companies…
                        </span>
                    ) : null}
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        title={
                            companies.length === 0
                                ? "No client companies yet"
                                : "No companies match your search"
                        }
                        hint={
                            companies.length === 0
                                ? "A company is created when a lead is converted or a client signs up."
                                : "Try a different company name or contact email."
                        }
                    />
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Contacts</th>
                                    <th>Projects</th>
                                    <th>Active</th>
                                    <th>Last activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((company) => (
                                    <tr key={company._id}>
                                        <td>
                                            <button
                                                type="button"
                                                className={styles.linkButton}
                                                onClick={() =>
                                                    setSelectedId(company._id)
                                                }
                                            >
                                                {company.name}
                                            </button>
                                            <div
                                                className={`${styles.cellMuted} ${styles.mono}`}
                                            >
                                                {company.slug}
                                            </div>
                                        </td>
                                        <td className={styles.cellMuted}>
                                            {company.clientCount}
                                        </td>
                                        <td className={styles.cellMuted}>
                                            {company.projectCount}
                                        </td>
                                        <td className={styles.cellMuted}>
                                            {company.activeProjectCount}
                                        </td>
                                        <td className={styles.cellMuted}>
                                            {relativeTime(
                                                company.latestActivityAt,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {selected ? (
                <CompanyDetail
                    key={selected._id}
                    company={selected}
                    onClose={() => setSelectedId(null)}
                />
            ) : null}
        </div>
    );
}

function CompanyDetail({
    company,
    onClose,
}: {
    company: CompanyRosterEntry;
    onClose: () => void;
}) {
    return (
        <div className={styles.split}>
            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div>
                        <p className={styles.pageKicker}>
                            Client account
                        </p>
                        <h2 className={styles.panelTitle}>{company.name}</h2>
                        <p className={styles.panelHint}>
                            Created {formatDate(company.createdAt)}
                        </p>
                    </div>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
                <div className={styles.panelBody}>
                    <div className={styles.kv}>
                        <span className={styles.kvLabel}>Company name</span>
                        <span className={styles.kvValue}>{company.name}</span>
                        <span className={styles.kvLabel}>Slug</span>
                        <span className={`${styles.kvValue} ${styles.mono}`}>
                            {company.slug}
                        </span>
                        <span className={styles.kvLabel}>Portal contacts</span>
                        <span className={styles.kvValue}>
                            {company.clientCount}
                        </span>
                        <span className={styles.kvLabel}>Projects</span>
                        <span className={styles.kvValue}>
                            {company.projectCount} ({company.activeProjectCount}{" "}
                            active)
                        </span>
                        <span className={styles.kvLabel}>Last activity</span>
                        <span className={styles.kvValue}>
                            {relativeTime(company.latestActivityAt)}
                        </span>
                    </div>
                </div>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <h2 className={styles.panelTitle}>People</h2>
                </div>
                <div className={styles.panelBody}>
                    {company.clients.length === 0 ? (
                        <p className={styles.panelHint}>
                            No portal contacts recorded for this company.
                        </p>
                    ) : (
                        <ul className={styles.miniList}>
                            {company.clients.map((client) => (
                                <li className={styles.miniItem} key={client._id}>
                                    <div className={styles.miniItemMain}>
                                        <p className={styles.miniItemTitle}>
                                            {client.name || client.email}
                                        </p>
                                        <p className={styles.miniItemMeta}>
                                            {client.email}
                                            {client.phone ? ` · ${client.phone}` : ""}
                                        </p>
                                    </div>
                                    <Badge tone="blue">{client.role}</Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div>
                        <h2 className={styles.panelTitle}>Projects</h2>
                        <p className={styles.panelHint}>
                            Manage status, progress, and the team from the
                            Projects tab.
                        </p>
                    </div>
                </div>
                <div className={styles.panelBody}>
                    {company.projects.length === 0 ? (
                        <p className={styles.panelHint}>
                            This company has not requested any projects yet.
                        </p>
                    ) : (
                        <ul className={styles.miniList}>
                            {company.projects.map((project) => (
                                <li className={styles.miniItem} key={project._id}>
                                    <div className={styles.miniItemMain}>
                                        <p className={styles.miniItemTitle}>
                                            {project.name}
                                        </p>
                                        <p className={styles.miniItemMeta}>
                                            {project.progress}% · Updated{" "}
                                            {relativeTime(project.updatedAt)}
                                        </p>
                                    </div>
                                    <ProjectStatusBadge status={project.status} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
}
