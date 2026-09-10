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

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";

export default function AdminPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState("");
    const [leads, setLeads] = useState<Lead[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function loadLeads(authToken: string) {
        const response = await fetch(`${apiUrl}/api/contact`, {
            headers: { Authorization: `Bearer ${authToken}` },
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
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.message || "Login failed.");
            setToken(result.data.token);
            await loadLeads(result.data.token);
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Login failed.",
            );
        } finally {
            setLoading(false);
        }
    }

    function logout() {
        setToken("");
        setLeads([]);
        setPassword("");
    }

    if (!token) {
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
                            </article>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}
