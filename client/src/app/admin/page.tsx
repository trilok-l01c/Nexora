"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { defaultHomeContent, type HomeContent } from "../homeContent";
import { useClientAuth } from "../client/ClientAuthContext";
import PortfolioManager from "./PortfolioManager";
import styles from "./page.module.css";

type Project = {
    _id: string;
    name: string;
    companyId: string;
    serviceType: string;
    description: string;
    status: string;
    progress: number;
    createdAt: string;
};

type LeadNote = {
    _id: string;
    text: string;
    type: "note" | "status" | "converted";
    authorName?: string;
    createdAt: string;
};

type Lead = {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    service: string;
    message: string;
    source: string;
    status: "new" | "contacted" | "in_progress" | "completed" | "rejected";
    notes?: LeadNote[];
    convertedCompanyId?: string;
    convertedUserId?: string;
    convertedAt?: string;
    createdAt: string;
    updatedAt: string;
};

type LeadStatus = "all" | Lead["status"];

const leadStatuses: Exclude<LeadStatus, "all">[] = [
    "new",
    "contacted",
    "in_progress",
    "completed",
    "rejected",
];

const leadStatusLabels: Record<Lead["status"], string> = {
    new: "New",
    contacted: "Contacted",
    in_progress: "In progress",
    completed: "Converted",
    rejected: "Lost",
};

// Statuses staff can set by hand. `completed` is intentionally absent: it means
// "converted to client" and is only reachable through the conversion form
// below, which provisions the portal account. It stays in `leadStatuses` so the
// filter row can still list converted leads.
const manualLeadStatuses: Exclude<LeadStatus, "all" | "completed">[] = [
    "new",
    "contacted",
    "in_progress",
    "rejected",
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";

type ContentSection = "hero" | "solutions" | "industries";

function Field({
    label,
    value,
    onChange,
    multiline = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    multiline?: boolean;
}) {
    return (
        <label className={styles.editorField}>
            <span>{label}</span>
            {multiline ? (
                <textarea
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    rows={3}
                />
            ) : (
                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            )}
        </label>
    );
}

export default function AdminPage() {
    const { refresh } = useClientAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [homeContent, setHomeContent] =
        useState<HomeContent>(defaultHomeContent);
    const [contentSection, setContentSection] =
        useState<ContentSection>("hero");
    const [leads, setLeads] = useState<Lead[]>([]);
    const [statusFilter, setStatusFilter] = useState<LeadStatus>("all");
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [leadMessage, setLeadMessage] = useState("");
    const [leadForm, setLeadForm] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        service: "",
    });
    const [noteText, setNoteText] = useState("");
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteText, setEditingNoteText] = useState("");
    const [conversion, setConversion] = useState({
        companyName: "",
        clientName: "",
        email: "",
        phone: "",
        password: "",
    });

    function openLead(lead: Lead) {
        setSelectedLead(lead);
        setLeadForm({
            name: lead.name,
            email: lead.email,
            phone: lead.phone || "",
            company: lead.company || "",
            service: lead.service,
        });
        setConversion({
            companyName: lead.company || "",
            clientName: lead.name,
            email: lead.email,
            phone: lead.phone || "",
            password: "",
        });
        setNoteText("");
        setEditingNoteId(null);
        setLeadMessage("");
    }

    function applyLeadResult(lead: Lead) {
        setSelectedLead(lead);
        setLeadForm({
            name: lead.name,
            email: lead.email,
            phone: lead.phone || "",
            company: lead.company || "",
            service: lead.service,
        });
    }

    async function loadLeads(filter: LeadStatus = statusFilter) {
        const query = filter === "all" ? "" : `?status=${filter}`;
        const response = await fetch(`${apiUrl}/api/admin/leads${query}`, {
            credentials: "include",
        });
        const result = await response.json();
        if (!response.ok)
            throw new Error(result.message || "Could not load leads.");
        setLeads(result.data);
    }

    async function filterLeads(status: LeadStatus) {
        setStatusFilter(status);
        try {
            await loadLeads(status);
        } catch (error) {
            setLeadMessage(
                error instanceof Error ? error.message : "Could not load leads.",
            );
        }
    }

    async function saveLeadChanges() {
        if (!selectedLead) return;
        setLeadMessage("");
        const body: Record<string, string> = {};
        if (leadForm.name !== selectedLead.name) body.name = leadForm.name;
        if (leadForm.email !== selectedLead.email) body.email = leadForm.email;
        if (leadForm.phone !== (selectedLead.phone || ""))
            body.phone = leadForm.phone;
        if (leadForm.company !== (selectedLead.company || ""))
            body.company = leadForm.company;
        if (leadForm.service !== selectedLead.service)
            body.service = leadForm.service;
        if (Object.keys(body).length === 0) {
            setLeadMessage("No contact changes to save.");
            return;
        }
        try {
            const response = await fetch(
                `${apiUrl}/api/admin/leads/${selectedLead._id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(body),
                },
            );
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.message || "Could not update lead.");
            applyLeadResult(result.data);
            setLeadMessage("Lead details saved.");
            await loadLeads();
        } catch (error) {
            setLeadMessage(
                error instanceof Error ? error.message : "Could not update lead.",
            );
        }
    }

    async function changeLeadStatus(status: Lead["status"]) {
        if (!selectedLead) return;
        setLeadMessage("");
        try {
            const response = await fetch(
                `${apiUrl}/api/admin/leads/${selectedLead._id}/status`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ status }),
                },
            );
            const result = await response.json();
            if (!response.ok)
                throw new Error(
                    result.message || "Could not update lead status.",
                );
            applyLeadResult(result.data);
            setLeadMessage("Lead status updated.");
            await loadLeads();
        } catch (error) {
            setLeadMessage(
                error instanceof Error
                    ? error.message
                    : "Could not update lead status.",
            );
        }
    }

    async function submitNote(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selectedLead) return;
        setLeadMessage("");
        try {
            const response = await fetch(
                `${apiUrl}/api/admin/leads/${selectedLead._id}/notes`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ text: noteText }),
                },
            );
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.message || "Could not add note.");
            applyLeadResult(result.data);
            setNoteText("");
            setLeadMessage("Note added.");
            await loadLeads();
        } catch (error) {
            setLeadMessage(
                error instanceof Error ? error.message : "Could not add note.",
            );
        }
    }

    async function saveNoteEdit(noteId: string) {
        if (!selectedLead) return;
        setLeadMessage("");
        try {
            const response = await fetch(
                `${apiUrl}/api/admin/leads/${selectedLead._id}/notes/${noteId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ text: editingNoteText }),
                },
            );
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.message || "Could not update note.");
            applyLeadResult(result.data);
            setEditingNoteId(null);
            setLeadMessage("Note updated.");
            await loadLeads();
        } catch (error) {
            setLeadMessage(
                error instanceof Error ? error.message : "Could not update note.",
            );
        }
    }

    async function submitConversion(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selectedLead) return;
        setLeadMessage("");
        try {
            const response = await fetch(
                `${apiUrl}/api/admin/leads/${selectedLead._id}/convert`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(conversion),
                },
            );
            const result = await response.json();
            if (!response.ok)
                throw new Error(
                    result.message || "Could not convert this lead.",
                );
            applyLeadResult(result.data.lead);
            setConversion((current) => ({ ...current, password: "" }));
            setLeadMessage(
                `${result.message} Portal account: ${result.data.user.email} (${result.data.company.name}). Share the password with the client securely.`,
            );
            await loadLeads();
        } catch (error) {
            setLeadMessage(
                error instanceof Error
                    ? error.message
                    : "Could not convert this lead.",
            );
        }
    }


    async function loadProjects() {
        const response = await fetch(`${apiUrl}/api/admin/projects`, {
            credentials: "include",
        });
        const result = await response.json();
        if (!response.ok)
            throw new Error(result.message || "Could not load projects.");
        setProjects(result.data);
    }

    async function updateProject(
        id: string,
        changes: { status?: string; progress?: number },
    ) {
        const response = await fetch(`${apiUrl}/api/admin/projects/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(changes),
        });
        const result = await response.json();
        if (!response.ok) {
            setMessage(result.message || "Could not update project.");
            return;
        }
        await loadProjects();
    }

    async function loadHomeContent() {
        const response = await fetch(`${apiUrl}/api/admin/home`, {
            credentials: "include",
        });
        const result = await response.json();
        if (!response.ok)
            throw new Error(
                result.message || "Could not load homepage content.",
            );
        const content: HomeContent = {
            ...defaultHomeContent,
            ...result.data,
            hero: { ...defaultHomeContent.hero, ...result.data.hero },
            ticker: result.data.ticker || defaultHomeContent.ticker,
            solutions: result.data.solutions || defaultHomeContent.solutions,
            industries: result.data.industries || defaultHomeContent.industries,
        };
        setHomeContent(content);
    }

    async function saveHomeContent() {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/admin/home`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content: homeContent }),
            });
            const result = await response.json();
            if (!response.ok)
                throw new Error(
                    result.message || "Could not save homepage content.",
                );
            setHomeContent(result.data);
            setMessage("Homepage content saved.");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Could not save homepage content.",
            );
        } finally {
            setLoading(false);
        }
    }

    function updateHomeContent<K extends keyof HomeContent>(
        section: K,
        value: HomeContent[K],
    ) {
        setHomeContent((current) => ({ ...current, [section]: value }));
    }

    function updateListItem<
        K extends "ticker" | "solutions" | "industries",
    >(section: K, index: number, value: HomeContent[K][number]) {
        const next = [...homeContent[section]];
        next[index] = value;
        updateHomeContent(section, next as HomeContent[K]);
    }

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${apiUrl}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.message || "Login failed.");
            await loadProjects();
            await loadHomeContent();
            try {
                await loadLeads();
            } catch {
                // The lead inbox surfaces its own retry error; login should
                // not fail because of it.
            }
            setAuthenticated(true);
            // Re-read the shared session so the site navigation shows the
            // signed-in (admin) state instead of a stale "Sign In" button.
            await refresh().catch(() => undefined);
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Login failed.",
            );
        } finally {
            setLoading(false);
        }
    }

    function logout() {
        fetch(`${apiUrl}/api/admin/logout`, {
            method: "POST",
            credentials: "include",
        }).catch(() => undefined);
        setAuthenticated(false);
        setProjects([]);
        setLeads([]);
        setSelectedLead(null);
        setPassword("");
        // Same server endpoint clears the admin cookie, so drop the client-side
        // session state as well and let the navigation re-render as signed out.
        void refresh();
    }

    if (!authenticated) {
        return (
            <main className={styles.page}>
                <section className={styles.loginPanel}>
                    <Link className={styles.brand} href="/">
                        <span className={styles.brandMark}>N</span>
                        Nexora
                    </Link>
                    <p className={styles.kicker}>Internal workspace</p>
                    <h1>
                        Welcome
                        <br />
                        <em>back.</em>
                    </h1>
                    <form onSubmit={handleLogin}>
                        <label>
                            Email
                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                                autoComplete="username"
                            />
                        </label>
                        <label>
                            Password
                            <input
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                required
                                autoComplete="current-password"
                            />
                        </label>
                        <p className={styles.message} aria-live="polite">
                            {message}
                        </p>
                        <button type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}{" "}
                            <span>↗</span>
                        </button>
                    </form>
                </section>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <section className={styles.dashboard}>
                <header className={styles.header}>
                    <Link className={styles.brand} href="/">
                        <span className={styles.brandMark}>N</span>
                        Nexora
                    </Link>
                    <button className={styles.logout} onClick={logout}>
                        Sign out
                    </button>
                </header>
                <p className={styles.kicker}>Project operations</p>
                <h1>
                    Work worth
                    <br />
                    <em>moving.</em>
                </h1>
                <section
                    className={styles.leadSection}
                    aria-label="Lead inbox"
                >
                    <p className={styles.editorKicker}>Lead inbox</p>
                    <h2 className={styles.leadHeading}>
                        People ready
                        <br />
                        <em>to move.</em>
                    </h2>
                    <div
                        className={styles.filters}
                        aria-label="Filter leads by status"
                    >
                        {(["all", ...leadStatuses] as LeadStatus[]).map(
                            (status) => (
                                <button
                                    className={
                                        statusFilter === status
                                            ? styles.filterActive
                                            : styles.filter
                                    }
                                    key={status}
                                    type="button"
                                    onClick={() => filterLeads(status)}
                                >
                                    {status === "all"
                                        ? "All"
                                        : leadStatusLabels[status]}
                                </button>
                            ),
                        )}
                    </div>
                    {selectedLead && (
                        <div className={styles.leadDetail}>
                            <div className={styles.leadDetailHeader}>
                                <strong>{selectedLead.name}</strong>
                                <span
                                    className={styles.leadStatusChip}
                                    data-status={selectedLead.status}
                                >
                                    {leadStatusLabels[selectedLead.status]}
                                </span>
                                <button
                                    type="button"
                                    className={styles.leadClose}
                                    onClick={() => {
                                        setSelectedLead(null);
                                        setLeadMessage("");
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                            <p className={styles.leadMeta}>
                                {selectedLead.email}
                                {selectedLead.company
                                    ? ` · ${selectedLead.company}`
                                    : ""}
                                {selectedLead.phone
                                    ? ` · ${selectedLead.phone}`
                                    : ""}
                            </p>
                            {selectedLead.convertedAt ? (
                                <div className={styles.convertedBanner}>
                                    Converted to client on{" "}
                                    {new Date(
                                        selectedLead.convertedAt,
                                    ).toLocaleString()}
                                    . This client can now sign in to the
                                    portal.
                                </div>
                            ) : null}
                            <p className={styles.leadMessage} aria-live="polite">
                                {leadMessage}
                            </p>
                            <div className={styles.leadGrid}>
                                <label className={styles.leadField}>
                                    <span>Name</span>
                                    <input
                                        value={leadForm.name}
                                        onChange={(event) =>
                                            setLeadForm((current) => ({
                                                ...current,
                                                name: event.target.value,
                                            }))
                                        }
                                        maxLength={100}
                                    />
                                </label>
                                <label className={styles.leadField}>
                                    <span>Email</span>
                                    <input
                                        type="email"
                                        value={leadForm.email}
                                        onChange={(event) =>
                                            setLeadForm((current) => ({
                                                ...current,
                                                email: event.target.value,
                                            }))
                                        }
                                        maxLength={254}
                                    />
                                </label>
                                <label className={styles.leadField}>
                                    <span>Phone</span>
                                    <input
                                        type="tel"
                                        value={leadForm.phone}
                                        onChange={(event) =>
                                            setLeadForm((current) => ({
                                                ...current,
                                                phone: event.target.value,
                                            }))
                                        }
                                        maxLength={30}
                                    />
                                </label>
                                <label className={styles.leadField}>
                                    <span>Company</span>
                                    <input
                                        value={leadForm.company}
                                        onChange={(event) =>
                                            setLeadForm((current) => ({
                                                ...current,
                                                company: event.target.value,
                                            }))
                                        }
                                        maxLength={120}
                                    />
                                </label>
                                <label className={styles.leadField}>
                                    <span>Service</span>
                                    <input
                                        value={leadForm.service}
                                        onChange={(event) =>
                                            setLeadForm((current) => ({
                                                ...current,
                                                service: event.target.value,
                                            }))
                                        }
                                        maxLength={120}
                                    />
                                </label>
                            </div>
                            <div className={styles.leadActions}>
                                <button type="button" onClick={saveLeadChanges}>
                                    Save contact details
                                </button>
                                {selectedLead.status !== "completed" && (
                                    <label className={styles.statusSelect}>
                                        <span>Status</span>
                                        <select
                                            value={selectedLead.status}
                                            onChange={(event) =>
                                                changeLeadStatus(
                                                    event.target
                                                        .value as Lead["status"],
                                                )
                                            }
                                            aria-label={`Update status for ${selectedLead.name}`}
                                        >
                                            {manualLeadStatuses.map(
                                                (status) => (
                                                    <option
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {
                                                            leadStatusLabels[
                                                                status
                                                            ]
                                                        }
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </label>
                                )}
                            </div>
                            <div className={styles.leadRequirement}>
                                <strong>Requirement</strong>
                                <p>{selectedLead.message}</p>
                                <small>
                                    Source: {selectedLead.source} · Received{" "}
                                    {new Date(
                                        selectedLead.createdAt,
                                    ).toLocaleString()}
                                </small>
                            </div>
                            <div className={styles.leadTimeline}>
                                <strong>Relationship history</strong>
                                {[...(selectedLead.notes || [])]
                                    .sort(
                                        (left, right) =>
                                            new Date(right.createdAt).getTime() -
                                            new Date(left.createdAt).getTime(),
                                    )
                                    .map((note) => (
                                        <div
                                            className={styles.timelineItem}
                                            key={note._id}
                                        >
                                            <div className={styles.timelineTop}>
                                                <span
                                                    className={styles.timelineType}
                                                    data-type={note.type}
                                                >
                                                    {note.type === "note"
                                                        ? "Note"
                                                        : note.type === "status"
                                                          ? "Update"
                                                          : "Converted"}
                                                </span>
                                                <time>
                                                    {new Date(
                                                        note.createdAt,
                                                    ).toLocaleString()}
                                                </time>
                                            </div>
                                            {editingNoteId === note._id ? (
                                                <div className={styles.noteEditor}>
                                                    <textarea
                                                        value={editingNoteText}
                                                        onChange={(event) =>
                                                            setEditingNoteText(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        maxLength={2000}
                                                        rows={3}
                                                    />
                                                    <div
                                                        className={
                                                            styles.updateActions
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                saveNoteEdit(
                                                                    note._id,
                                                                )
                                                            }
                                                        >
                                                            Save note
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setEditingNoteId(
                                                                    null,
                                                                )
                                                            }
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p>{note.text}</p>
                                                    <small>
                                                        {note.authorName ||
                                                            "Nexora team"}
                                                    </small>
                                                    {note.type === "note" && (
                                                        <button
                                                            type="button"
                                                            className={
                                                                styles.noteEditButton
                                                            }
                                                            onClick={() => {
                                                                setEditingNoteId(
                                                                    note._id,
                                                                );
                                                                setEditingNoteText(
                                                                    note.text,
                                                                );
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                {(selectedLead.notes || []).length === 0 && (
                                    <p className={styles.timelineEmpty}>
                                        No conversation history yet.
                                    </p>
                                )}
                                <form
                                    className={styles.noteForm}
                                    onSubmit={submitNote}
                                >
                                    <textarea
                                        value={noteText}
                                        onChange={(event) =>
                                            setNoteText(event.target.value)
                                        }
                                        placeholder="Add an internal note about this conversation…"
                                        maxLength={2000}
                                        rows={3}
                                        required
                                    />
                                    <button type="submit">Add note</button>
                                </form>
                                {!selectedLead.convertedAt && (
                                    <form
                                        className={styles.convertPanel}
                                        onSubmit={submitConversion}
                                    >
                                        <div className={styles.editorCardHeader}>
                                            <strong>Convert to client</strong>
                                        </div>
                                        <p className={styles.convertHint}>
                                            Creates a client account for this
                                            lead (reusing an existing company
                                            with the same name). Share the
                                            initial password with the client
                                            securely — Nexora does not send
                                            emails automatically.
                                        </p>
                                        <div className={styles.leadGrid}>
                                            <label className={styles.leadField}>
                                                <span>Company name</span>
                                                <input
                                                    value={conversion.companyName}
                                                    onChange={(event) =>
                                                        setConversion(
                                                            (current) => ({
                                                                ...current,
                                                                companyName:
                                                                    event.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    maxLength={160}
                                                    required
                                                />
                                            </label>
                                            <label className={styles.leadField}>
                                                <span>Client name</span>
                                                <input
                                                    value={conversion.clientName}
                                                    onChange={(event) =>
                                                        setConversion(
                                                            (current) => ({
                                                                ...current,
                                                                clientName:
                                                                    event.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    maxLength={120}
                                                    required
                                                />
                                            </label>
                                            <label className={styles.leadField}>
                                                <span>Client email</span>
                                                <input
                                                    type="email"
                                                    value={conversion.email}
                                                    onChange={(event) =>
                                                        setConversion(
                                                            (current) => ({
                                                                ...current,
                                                                email: event
                                                                    .target
                                                                    .value,
                                                            }),
                                                        )
                                                    }
                                                    maxLength={254}
                                                    required
                                                />
                                            </label>
                                            <label className={styles.leadField}>
                                                <span>Client phone</span>
                                                <input
                                                    type="tel"
                                                    value={conversion.phone}
                                                    onChange={(event) =>
                                                        setConversion(
                                                            (current) => ({
                                                                ...current,
                                                                phone: event
                                                                    .target
                                                                    .value,
                                                            }),
                                                        )
                                                    }
                                                    maxLength={32}
                                                />
                                            </label>
                                            <label className={styles.leadField}>
                                                <span>Initial password</span>
                                                <input
                                                    type="text"
                                                    value={conversion.password}
                                                    onChange={(event) =>
                                                        setConversion(
                                                            (current) => ({
                                                                ...current,
                                                                password:
                                                                    event.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    minLength={8}
                                                    maxLength={128}
                                                    required
                                                    autoComplete="new-password"
                                                />
                                            </label>
                                        </div>
                                        <button type="submit">
                                            Convert lead
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                    <div className={styles.leads}>
                        {leads.length === 0 ? (
                            <p className={styles.empty}>No leads yet.</p>
                        ) : (
                            leads.map((lead) => (
                                <article className={styles.lead} key={lead._id}>
                                    <div className={styles.leadTop}>
                                        <strong>{lead.name}</strong>
                                        <span>
                                            {leadStatusLabels[lead.status]}
                                        </span>
                                    </div>
                                    <p>
                                        {lead.email}
                                        {lead.company
                                            ? ` · ${lead.company}`
                                            : ""}
                                    </p>
                                    {lead.phone && <p>{lead.phone}</p>}
                                    <p className={styles.service}>
                                        {lead.service}
                                    </p>
                                    <div>{lead.message}</div>
                                    <small>
                                        {new Date(
                                            lead.createdAt,
                                        ).toLocaleString()}
                                    </small>
                                    <button
                                        type="button"
                                        className={styles.leadOpen}
                                        onClick={() => openLead(lead)}
                                    >
                                        {selectedLead?._id === lead._id
                                            ? "Edit lead"
                                            : "Open lead"}
                                    </button>
                                </article>
                            ))
                        )}
                    </div>
                </section>
                <section className={styles.contentEditor}>
                    <div className={styles.editorHeader}>
                        <div>
                            <p className={styles.editorKicker}>
                                Homepage content
                            </p>
                            <p className={styles.editorHint}>
                                Edit the homepage content document, then publish
                                it.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={saveHomeContent}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save homepage"}
                        </button>
                    </div>
                    <nav
                        className={styles.editorTabs}
                        aria-label="Homepage sections"
                    >
                        {(
                            [
                                ["hero", "Hero"],
                                ["solutions", "Solutions"],
                                ["industries", "Industries"],
                            ] as [ContentSection, string][]
                        ).map(([value, label]) => (
                            <button
                                className={
                                    contentSection === value
                                        ? styles.tabActive
                                        : styles.tab
                                }
                                key={value}
                                type="button"
                                onClick={() => setContentSection(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>
                    <div className={styles.editorBody}>
                        {contentSection === "hero" && (
                            <div className={styles.editorGrid}>
                                <Field
                                    label="Eyebrow"
                                    value={homeContent.hero.eyebrow}
                                    onChange={(value) =>
                                        updateHomeContent("hero", {
                                            ...homeContent.hero,
                                            eyebrow: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Title"
                                    value={homeContent.hero.title}
                                    onChange={(value) =>
                                        updateHomeContent("hero", {
                                            ...homeContent.hero,
                                            title: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Emphasis"
                                    value={homeContent.hero.titleEmphasis}
                                    onChange={(value) =>
                                        updateHomeContent("hero", {
                                            ...homeContent.hero,
                                            titleEmphasis: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Title ending"
                                    value={homeContent.hero.titleSuffix}
                                    onChange={(value) =>
                                        updateHomeContent("hero", {
                                            ...homeContent.hero,
                                            titleSuffix: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Description"
                                    multiline
                                    value={homeContent.hero.text}
                                    onChange={(value) =>
                                        updateHomeContent("hero", {
                                            ...homeContent.hero,
                                            text: value,
                                        })
                                    }
                                />
                            </div>
                        )}
                        {contentSection === "solutions" && (
                            <div className={styles.editorList}>
                                {homeContent.solutions.map(
                                    (solution, index) => (
                                        <div
                                            className={styles.editorCard}
                                            key={`${solution.number}-${index}`}
                                        >
                                            <div
                                                className={
                                                    styles.editorCardHeader
                                                }
                                            >
                                                <strong>
                                                    Solution {index + 1}
                                                </strong>
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.removeButton
                                                    }
                                                    onClick={() =>
                                                        updateHomeContent(
                                                            "solutions",
                                                            homeContent.solutions.filter(
                                                                (
                                                                    _,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex !==
                                                                    index,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className={styles.editorGrid}>
                                                <Field
                                                    label="Number"
                                                    value={solution.number}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                number: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Label"
                                                    value={solution.label}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                label: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Title"
                                                    value={solution.title}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                title: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Title second line"
                                                    value={
                                                        solution.titleSecondLine
                                                    }
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                titleSecondLine:
                                                                    value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Link label"
                                                    value={solution.link}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                link: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Link URL"
                                                    value={solution.href}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                href: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Description"
                                                    multiline
                                                    value={solution.text}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                text: value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ),
                                )}
                                <button
                                    type="button"
                                    className={styles.addButton}
                                    onClick={() =>
                                        updateHomeContent("solutions", [
                                            ...homeContent.solutions,
                                            {
                                                number: String(
                                                    homeContent.solutions
                                                        .length + 1,
                                                ).padStart(2, "0"),
                                                label: "New",
                                                title: "New solution",
                                                titleSecondLine:
                                                    "Add a description.",
                                                text: "Describe this solution.",
                                                href: "/services/software-development",
                                                link: "Learn more",
                                            },
                                        ])
                                    }
                                >
                                    Add solution
                                </button>
                            </div>
                        )}
                        {contentSection === "industries" && (
                            <div className={styles.editorList}>
                                {homeContent.industries.map(
                                    (industry, index) => (
                                        <div
                                            className={styles.editorCard}
                                            key={`${industry.number}-${index}`}
                                        >
                                            <div
                                                className={
                                                    styles.editorCardHeader
                                                }
                                            >
                                                <strong>
                                                    Industry {index + 1}
                                                </strong>
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.removeButton
                                                    }
                                                    onClick={() =>
                                                        updateHomeContent(
                                                            "industries",
                                                            homeContent.industries.filter(
                                                                (
                                                                    _,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex !==
                                                                    index,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className={styles.editorGrid}>
                                                <Field
                                                    label="Number"
                                                    value={industry.number}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "industries",
                                                            index,
                                                            {
                                                                ...industry,
                                                                number: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Name"
                                                    value={industry.name}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "industries",
                                                            index,
                                                            {
                                                                ...industry,
                                                                name: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Title"
                                                    value={industry.title}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "industries",
                                                            index,
                                                            {
                                                                ...industry,
                                                                title: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Outcomes"
                                                    value={industry.outcomes}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "industries",
                                                            index,
                                                            {
                                                                ...industry,
                                                                outcomes: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Description"
                                                    multiline
                                                    value={industry.text}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "industries",
                                                            index,
                                                            {
                                                                ...industry,
                                                                text: value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ),
                                )}
                                <button
                                    type="button"
                                    className={styles.addButton}
                                    onClick={() =>
                                        updateHomeContent("industries", [
                                            ...homeContent.industries,
                                            {
                                                number: String(
                                                    homeContent.industries
                                                        .length + 1,
                                                ).padStart(2, "0"),
                                                name: "New industry",
                                                title: "A clearer way forward.",
                                                text: "Describe how Nexora helps this industry.",
                                                outcomes:
                                                    "Key outcome · Key outcome",
                                            },
                                        ])
                                    }
                                >
                                    Add industry
                                </button>
                            </div>
                        )}
                        <div className={styles.tickerEditor}>
                            <div className={styles.editorCardHeader}>
                                <strong>Scrolling ticker</strong>
                                <button
                                    type="button"
                                    className={styles.addButton}
                                    onClick={() =>
                                        updateHomeContent("ticker", [
                                            ...homeContent.ticker,
                                            "New message",
                                        ])
                                    }
                                >
                                    Add item
                                </button>
                            </div>
                            {homeContent.ticker.map((item, index) => (
                                <div
                                    key={`ticker-${index}`}
                                    className={styles.tickerItem}
                                >
                                    <Field
                                        label={`Item ${index + 1}`}
                                        value={item}
                                        onChange={(value) =>
                                            updateListItem(
                                                "ticker",
                                                index,
                                                value,
                                            )
                                        }
                                    />
                                    <button
                                        type="button"
                                        className={styles.tickerRemove}
                                        onClick={() =>
                                            updateHomeContent(
                                                "ticker",
                                                homeContent.ticker.filter(
                                                    (_, i) => i !== index,
                                                ),
                                            )
                                        }
                                        aria-label={`Remove item ${index + 1}`}
                                    >
                                        −
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section className={styles.contentEditor}>
                    <div className={styles.editorHeader}>
                        <div>
                            <p className={styles.editorKicker}>Projects</p>
                            <p className={styles.editorHint}>
                                New requests appear here for review. Project
                                lifecycle fields remain staff-controlled.
                            </p>
                        </div>
                        <button type="button" onClick={loadProjects}>
                            Refresh projects
                        </button>
                    </div>
                    <div className={styles.projectList}>
                        {projects.length === 0 ? (
                            <p className={styles.empty}>
                                No projects have been requested yet.
                            </p>
                        ) : (
                            projects.map((project) => (
                                <article
                                    className={styles.projectCard}
                                    key={project._id}
                                >
                                    <div className={styles.projectCardTop}>
                                        <strong>{project.name}</strong>
                                        <span>{project.status}</span>
                                    </div>
                                    <p>
                                        {project.serviceType} ·{" "}
                                        {project.progress}% complete
                                    </p>
                                    <p>{project.description}</p>
                                    <small>
                                        Requested{" "}
                                        {new Date(
                                            project.createdAt,
                                        ).toLocaleString()}
                                    </small>
                                    <div className={styles.editorGrid}>
                                        <label className={styles.editorField}>
                                            <span>Status</span>
                                            <select
                                                value={project.status}
                                                onChange={(event) =>
                                                    updateProject(project._id, {
                                                        status: event.target
                                                            .value,
                                                    })
                                                }
                                            >
                                                {[
                                                    "Pending Review",
                                                    "Planning",
                                                    "Design",
                                                    "Development",
                                                    "Testing",
                                                    "Review",
                                                    "Deployment",
                                                    "Completed",
                                                    "On Hold",
                                                ].map((status) => (
                                                    <option key={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className={styles.editorField}>
                                            <span>Progress</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={project.progress}
                                                onChange={(event) =>
                                                    updateProject(project._id, {
                                                        progress: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </label>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>
                <PortfolioManager />
            </section>
        </main>
    );
}
