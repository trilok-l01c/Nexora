"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminData } from "../AdminDataContext";
import { adminJson } from "../adminApi";
import {
    TICKET_PRIORITIES,
    TICKET_STATUSES,
    formatDateTime,
    relativeTime,
    type Ticket,
    type TicketPriority,
    type TicketStatus,
} from "../adminTypes";
import {
    Alert,
    EmptyState,
    Field,
    TicketBadge,
} from "../components/primitives";
import { ArrowRightIcon, SearchIcon } from "../components/icons";
import styles from "../workspace.module.css";

type StatusFilter = TicketStatus | "all";

export default function QueriesSection() {
    const { tickets, loadTickets, loading, errors } = useAdminData();
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (tickets.length === 0) {
            void loadTickets().catch(() => undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const visibleTickets = useMemo(() => {
        const term = query.trim().toLowerCase();
        return tickets.filter((ticket) => {
            if (statusFilter !== "all" && ticket.status !== statusFilter) {
                return false;
            }
            if (!term) return true;
            return [
                ticket.subject,
                ticket.description,
                ticket.companyId?.name,
                ticket.createdBy?.name,
                ticket.createdBy?.email,
                ticket.projectId?.name,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term));
        });
    }, [tickets, statusFilter, query]);

    const selected = useMemo(
        () => tickets.find((ticket) => ticket._id === selectedId) ?? null,
        [tickets, selectedId],
    );

    const openCount = tickets.filter(
        (ticket) => ticket.status !== "Resolved",
    ).length;
    const urgentCount = tickets.filter(
        (ticket) => ticket.priority === "Urgent" && ticket.status !== "Resolved",
    ).length;

    async function triage(
        ticket: Ticket,
        changes: { status?: TicketStatus; priority?: TicketPriority },
    ) {
        setBusy(true);
        setMessage("");
        try {
            await adminJson(`/api/admin/tickets/${ticket._id}`, "PATCH", changes);
            await loadTickets();
            setMessage("Support query updated.");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Could not update the support query.",
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className={styles.stack}>
            <header className={styles.pageHeader}>
                <div>
                    <p className={styles.pageKicker}>Client care</p>
                    <h1 className={styles.pageTitle}>Queries &amp; Support</h1>
                    <p className={styles.pageSubtitle}>
                        Support requests raised by clients from their portal.
                        Triage each one by priority, then move it through the
                        workflow until it is resolved.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    {urgentCount > 0 ? (
                        <span className={styles.badge}>
                            {urgentCount} urgent
                        </span>
                    ) : null}
                    <span className={styles.badge}>
                        {openCount} open
                    </span>
                </div>
            </header>

            {errors.tickets ? (
                <Alert tone="red">{errors.tickets}</Alert>
            ) : null}
            {message ? <Alert tone="green">{message}</Alert> : null}

            <div className={styles.split}>
                <section className={styles.panel}>
                    <div className={styles.toolbar}>
                        <div
                            className={styles.filterGroup}
                            role="group"
                            aria-label="Filter queries by status"
                        >
                            <button
                                type="button"
                                className={`${styles.filterChip} ${
                                    statusFilter === "all"
                                        ? styles.filterChipActive
                                        : ""
                                }`}
                                aria-pressed={statusFilter === "all"}
                                onClick={() => setStatusFilter("all")}
                            >
                                All ({tickets.length})
                            </button>
                            {TICKET_STATUSES.map((status) => (
                                <button
                                    type="button"
                                    key={status}
                                    className={`${styles.filterChip} ${
                                        statusFilter === status
                                            ? styles.filterChipActive
                                            : ""
                                    }`}
                                    aria-pressed={statusFilter === status}
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <div
                            className={`${styles.searchField} ${styles.toolbarEnd}`}
                        >
                            <span className={styles.searchIcon}>
                                <SearchIcon />
                            </span>
                            <input
                                className={styles.input}
                                type="search"
                                value={query}
                                placeholder="Search subject, company, client…"
                                aria-label="Search support queries"
                                onChange={(event) => setQuery(event.target.value)}
                            />
                        </div>
                    </div>

                    {loading.tickets ? (
                        <div className={styles.empty}>
                            <p className={styles.emptyText}>
                                Loading support queries…
                            </p>
                        </div>
                    ) : visibleTickets.length === 0 ? (
                        <EmptyState
                            title={
                                tickets.length === 0
                                    ? "No support requests yet"
                                    : "No queries match these filters"
                            }
                            hint={
                                tickets.length === 0
                                    ? "When a client raises a request from their portal it lands here."
                                    : "Try a different status filter or search term."
                            }
                        />
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Query</th>
                                        <th>Company</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Raised</th>
                                        <th className={styles.cellActions}>
                                            Open
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleTickets.map((ticket) => (
                                        <tr
                                            key={ticket._id}
                                            className={
                                                ticket._id === selectedId
                                                    ? styles.tableRowActive
                                                    : ""
                                            }
                                        >
                                            <td>
                                                <div className={styles.cellStrong}>
                                                    {ticket.subject}
                                                </div>
                                                <div
                                                    className={`${styles.cellMuted} ${styles.cellClamp}`}
                                                >
                                                    {ticket.description}
                                                </div>
                                            </td>
                                            <td className={styles.cellMuted}>
                                                {ticket.companyId?.name || "—"}
                                            </td>
                                            <td>
                                                <TicketBadge
                                                    label={ticket.priority}
                                                    kind="priority"
                                                />
                                            </td>
                                            <td>
                                                <TicketBadge
                                                    label={ticket.status}
                                                    kind="status"
                                                />
                                            </td>
                                            <td className={styles.cellMuted}>
                                                {relativeTime(ticket.createdAt)}
                                            </td>
                                            <td className={styles.cellActions}>
                                                <button
                                                    type="button"
                                                    className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                                                    onClick={() =>
                                                        setSelectedId(ticket._id)
                                                    }
                                                >
                                                    Open
                                                    <ArrowRightIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className={styles.panelFooter}>
                        <span className={styles.spinnerText}>
                            {visibleTickets.length} shown · {openCount} still
                            open
                        </span>
                    </div>
                </section>

                <aside className={styles.stackTight}>
                    {selected ? (
                        <section className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <p className={styles.pageKicker}>
                                        #{selected.number}
                                    </p>
                                    <h2 className={styles.panelTitle}>
                                        {selected.subject}
                                    </h2>
                                    <p className={styles.panelHint}>
                                        Raised {formatDateTime(selected.createdAt)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                                    onClick={() => setSelectedId(null)}
                                >
                                    Close
                                </button>
                            </div>
                            <div className={styles.panelBody}>
                                <div className={styles.stackTight}>
                                    <div className={styles.kv}>
                                        <span className={styles.kvLabel}>
                                            Company
                                        </span>
                                        <span className={styles.kvValue}>
                                            {selected.companyId?.name || "—"}
                                        </span>
                                        <span className={styles.kvLabel}>
                                            Raised by
                                        </span>
                                        <span className={styles.kvValue}>
                                            {selected.createdBy?.name ||
                                                selected.createdBy?.email}
                                        </span>
                                        <span className={styles.kvLabel}>
                                            Related project
                                        </span>
                                        <span className={styles.kvValue}>
                                            {selected.projectId?.name ||
                                                "Not linked to a project"}
                                        </span>
                                        <span className={styles.kvLabel}>
                                            Description
                                        </span>
                                        <span
                                            className={styles.kvValue}
                                            style={{
                                                whiteSpace: "pre-wrap",
                                            }}
                                        >
                                            {selected.description}
                                        </span>
                                    </div>

                                    <div className={styles.grid2}>
                                        <Field
                                            label="Status"
                                            hint="Moving a query updates the client's portal."
                                        >
                                            <select
                                                className={styles.select}
                                                value={selected.status}
                                                disabled={busy}
                                                onChange={(event) =>
                                                    void triage(selected, {
                                                        status: event.target
                                                            .value as TicketStatus,
                                                    })
                                                }
                                            >
                                                {TICKET_STATUSES.map((status) => (
                                                    <option
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                        <Field label="Priority">
                                            <select
                                                className={styles.select}
                                                value={selected.priority}
                                                disabled={busy}
                                                onChange={(event) =>
                                                    void triage(selected, {
                                                        priority: event.target
                                                            .value as TicketPriority,
                                                    })
                                                }
                                            >
                                                {TICKET_PRIORITIES.map(
                                                    (priority) => (
                                                        <option
                                                            key={priority}
                                                            value={priority}
                                                        >
                                                            {priority}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </Field>
                                    </div>
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section className={styles.panel}>
                            <EmptyState
                                title="Select a support query"
                                hint="Choose a query from the list to read the full description and triage it."
                            />
                        </section>
                    )}

                    <section className={styles.panel}>
                        <div className={styles.panelBody}>
                            <p className={styles.panelTitle}>
                                How triage works
                            </p>
                            <p className={styles.panelHint}>
                                Clients raise queries from their portal. Set a
                                priority first, then move the query to In
                                Progress while you handle it and Resolved when it
                                is done. Everything here is visible to the
                                client immediately.
                            </p>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}
