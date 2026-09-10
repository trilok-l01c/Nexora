"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "./page.module.css";

type Lead = {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    service: string;
    message: string;
    status: string;
    createdAt: string;
};

type LeadStatus =
    | "all"
    | "new"
    | "contacted"
    | "in_progress"
    | "completed"
    | "rejected";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";

export default function AdminPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [statusFilter, setStatusFilter] = useState<LeadStatus>("all");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

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
            await loadLeads();
            setAuthenticated(true);
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
        setLeads([]);
        setPassword("");
    }

    async function updateStatus(
        id: string,
        status: Exclude<LeadStatus, "all">,
    ) {
        const response = await fetch(`${apiUrl}/api/admin/leads/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status }),
        });
        const result = await response.json();
        if (!response.ok) {
            setMessage(result.message || "Could not update lead status.");
            return;
        }
        await loadLeads();
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
                <p className={styles.kicker}>Lead inbox</p>
                <h1>
                    People ready
                    <br />
                    <em>to move.</em>
                </h1>
                <div
                    className={styles.filters}
                    aria-label="Filter leads by status"
                >
                    {(
                        [
                            "all",
                            "new",
                            "contacted",
                            "in_progress",
                            "completed",
                            "rejected",
                        ] as LeadStatus[]
                    ).map((status) => (
                        <button
                            className={
                                statusFilter === status
                                    ? styles.filterActive
                                    : styles.filter
                            }
                            key={status}
                            type="button"
                            onClick={() => {
                                setStatusFilter(status);
                                loadLeads(status);
                            }}
                        >
                            {status === "all"
                                ? "All"
                                : status.replace("_", " ")}
                        </button>
                    ))}
                </div>
                <div className={styles.leads}>
                    {leads.length === 0 ? (
                        <p className={styles.empty}>No contact requests yet.</p>
                    ) : (
                        leads.map((lead) => (
                            <article className={styles.lead} key={lead._id}>
                                <div className={styles.leadTop}>
                                    <strong>{lead.name}</strong>
                                    <span>{lead.status}</span>
                                </div>
                                <p>
                                    {lead.email}
                                    {lead.company ? ` · ${lead.company}` : ""}
                                </p>
                                <p className={styles.service}>{lead.service}</p>
                                <div>{lead.message}</div>
                                <small>
                                    {new Date(lead.createdAt).toLocaleString()}
                                </small>
                                <select
                                    className={styles.statusSelect}
                                    value={lead.status}
                                    onChange={(event) =>
                                        updateStatus(
                                            lead._id,
                                            event.target.value as Exclude<
                                                LeadStatus,
                                                "all"
                                            >,
                                        )
                                    }
                                    aria-label={`Update status for ${lead.name}`}
                                >
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="in_progress">
                                        In progress
                                    </option>
                                    <option value="completed">Completed</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </article>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}
