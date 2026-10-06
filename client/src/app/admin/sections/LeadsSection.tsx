"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminData } from "../AdminDataContext";
import {
    LEAD_STATUS_LABELS,
    LEAD_STATUSES,
    type Lead,
    type LeadStatus,
} from "../adminTypes";
import {
    Alert,
    Badge,
    EmptyState,
    LeadStatusBadge,
} from "../components/primitives";
import { ArrowRightIcon, SearchIcon } from "../components/icons";
import LeadDetailDialog from "./LeadDetailDialog";
import styles from "../workspace.module.css";

type StatusFilter = LeadStatus | "all";

export default function LeadsSection() {
    const { leads, loadLeads, loading, errors } = useAdminData();
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Loaded once on first visit; the context keeps the list warm for Overview.
    useEffect(() => {
        if (leads.length === 0) {
            void loadLeads("all").catch(() => undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function changeFilter(next: StatusFilter) {
        setStatusFilter(next);
        try {
            await loadLeads(next);
        } catch {
            // The context surfaces the message in the banner below the header.
        }
    }

    const visibleLeads = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return leads;
        return leads.filter((lead) =>
            [lead.name, lead.email, lead.company, lead.service, lead.message]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term)),
        );
    }, [leads, query]);

    const selectedLead = useMemo(
        () => leads.find((lead) => lead._id === selectedId) ?? null,
        [leads, selectedId],
    );

    const scopeCount =
        statusFilter === "all"
            ? leads.length
            : leads.filter((lead) => lead.status === statusFilter).length;

    return (
        <div className={styles.stack}>
            <header className={styles.pageHeader}>
                <div>
                    <p className={styles.pageKicker}>Pipeline</p>
                    <h1 className={styles.pageTitle}>Leads</h1>
                    <p className={styles.pageSubtitle}>
                        Every website enquiry lands here as a new lead. Work it
                        through the status lifecycle, keep notes on every call,
                        and convert it into a client account when it is ready.
                    </p>
                </div>
            </header>

            {errors.leads ? <Alert tone="red">{errors.leads}</Alert> : null}

            <section className={styles.panel}>
                <div className={styles.toolbar}>
                    <div
                        className={styles.filterGroup}
                        role="group"
                        aria-label="Filter leads by status"
                    >
                        <button
                            type="button"
                            className={`${styles.filterChip} ${
                                statusFilter === "all"
                                    ? styles.filterChipActive
                                    : ""
                            }`}
                            aria-pressed={statusFilter === "all"}
                            onClick={() => void changeFilter("all")}
                        >
                            All
                        </button>
                        {LEAD_STATUSES.map((status) => (
                            <button
                                type="button"
                                key={status}
                                className={`${styles.filterChip} ${
                                    statusFilter === status
                                        ? styles.filterChipActive
                                        : ""
                                }`}
                                aria-pressed={statusFilter === status}
                                onClick={() => void changeFilter(status)}
                            >
                                {LEAD_STATUS_LABELS[status]}
                            </button>
                        ))}
                    </div>
                    <div className={`${styles.searchField} ${styles.toolbarEnd}`}>
                        <span className={styles.searchIcon}>
                            <SearchIcon />
                        </span>
                        <input
                            className={styles.input}
                            type="search"
                            value={query}
                            placeholder="Search name, company, service…"
                            aria-label="Search leads"
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                </div>

                {loading.leads ? (
                    <div className={styles.empty}>
                        <p className={styles.emptyText}>Loading leads…</p>
                    </div>
                ) : visibleLeads.length === 0 ? (
                    <EmptyState
                        title={
                            query
                                ? "No leads match your search"
                                : statusFilter === "all"
                                  ? "No leads yet"
                                  : `No ${LEAD_STATUS_LABELS[statusFilter as LeadStatus].toLowerCase()} leads`
                        }
                        hint={
                            query
                                ? "Try a different name, company, or service."
                                : "Enquiries submitted through the public contact form appear here immediately."
                        }
                    />
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Contact</th>
                                    <th>Company</th>
                                    <th>Service</th>
                                    <th>Status</th>
                                    <th>Received</th>
                                    <th className={styles.cellActions}>Open</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleLeads.map((lead) => (
                                    <LeadRow
                                        key={lead._id}
                                        lead={lead}
                                        onOpen={() => setSelectedId(lead._id)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className={styles.panelFooter}>
                    <span className={styles.spinnerText}>
                        Showing {visibleLeads.length} of {scopeCount} lead
                        {scopeCount === 1 ? "" : "s"}
                    </span>
                </div>
            </section>

            {selectedLead ? (
                <LeadDetailDialog
                    key={selectedLead._id}
                    lead={selectedLead}
                    onClose={() => setSelectedId(null)}
                />
            ) : null}
        </div>
    );
}

function LeadRow({
    lead,
    onOpen,
}: {
    lead: Lead;
    onOpen: () => void;
}) {
    return (
        <tr>
            <td>
                <div className={styles.cellStrong}>{lead.name}</div>
                <div className={styles.cellMuted}>
                    {lead.email}
                    {lead.phone ? ` · ${lead.phone}` : ""}
                </div>
            </td>
            <td className={styles.cellMuted}>
                {lead.company || <span>—</span>}
            </td>
            <td>
                <Badge tone="blue">{lead.service}</Badge>
            </td>
            <td>
                <LeadStatusBadge status={lead.status} />
            </td>
            <td className={styles.cellMuted}>
                {new Date(lead.createdAt).toLocaleDateString("en-GB")}
            </td>
            <td className={styles.cellActions}>
                <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                    onClick={onOpen}
                >
                    Open
                    <ArrowRightIcon />
                </button>
            </td>
        </tr>
    );
}
