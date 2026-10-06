"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiUrl } from "../apiConfig";
import { useClientAuth } from "../client/ClientAuthContext";
import { AdminDataProvider, useAdminData } from "./AdminDataContext";
import AdminWorkspace from "./AdminWorkspace";
import { Alert } from "./components/primitives";
import styles from "./workspace.module.css";

// The admin page keeps its original responsibility: authenticate against
// POST /api/admin/login, then hand control to the tabbed workspace. The
// per-tab UI lives under ./sections; the API calls are unchanged.
export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState(false);

    return authenticated ? (
        <AdminDataProvider>
            <WorkspacePrefetch />
            <AdminShell onSignedOut={() => setAuthenticated(false)} />
        </AdminDataProvider>
    ) : (
        <LoginPanel onAuthenticated={() => setAuthenticated(true)} />
    );
}

// Warm the shared state right after login — the same three loads the previous
// single-page dashboard performed before rendering its dashboard.
function WorkspacePrefetch() {
    const { loadProjects, loadHomeContent, loadLeads } = useAdminData();

    useEffect(() => {
        void loadProjects().catch(() => undefined);
        void loadHomeContent().catch(() => undefined);
        void loadLeads("all").catch(() => undefined);
    }, [loadProjects, loadHomeContent, loadLeads]);

    return null;
}

function AdminShell({ onSignedOut }: { onSignedOut: () => void }) {
    const { refresh } = useClientAuth();

    async function signOut() {
        // Same endpoint the dashboard already used: it clears the admin cookie,
        // then the shared client session is re-read so the site navigation
        // renders its signed-out state too.
        await fetch(`${apiUrl}/api/admin/logout`, {
            method: "POST",
            credentials: "include",
        }).catch(() => undefined);
        await refresh().catch(() => undefined);
        onSignedOut();
    }

    return <AdminWorkspace onSignOut={() => void signOut()} />;
}

function LoginPanel({ onAuthenticated }: { onAuthenticated: () => void }) {
    const { refresh } = useClientAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

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
            if (!response.ok) {
                throw new Error(result.message || "Login failed.");
            }
            onAuthenticated();
            // Re-read the shared session so the site navigation shows the
            // signed-in (admin) state instead of a stale "Sign In" button.
            void refresh().catch(() => undefined);
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Login failed.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className={styles.authPage}>
            <section className={styles.authCard}>
                <div className={styles.authBrand}>
                    <span className={styles.brandMark}>N</span>
                    <span className={styles.brandText}>
                        Nexora
                        <small>Operations console</small>
                    </span>
                </div>
                <p className={styles.pageKicker}>Internal workspace</p>
                <h1 className={styles.authTitle}>
                    Sign in to
                    <br />
                    <span className={styles.authAccent}>your workspace.</span>
                </h1>
                <p className={styles.pageSubtitle}>
                    Leads, projects, support, and site content — everything the
                    team runs day to day lives behind this sign-in.
                </p>

                <form onSubmit={handleLogin} className={styles.authForm}>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Work email</span>
                        <input
                            className={styles.input}
                            type="email"
                            value={email}
                            placeholder="you@nexora.studio"
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            autoComplete="username"
                        />
                    </label>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Password</span>
                        <input
                            className={styles.input}
                            type="password"
                            value={password}
                            placeholder="••••••••"
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                            autoComplete="current-password"
                        />
                    </label>
                    {message ? <Alert tone="red">{message}</Alert> : null}
                    <button
                        type="submit"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in →"}
                    </button>
                    <p className={styles.authFoot}>
                        Protected by an HttpOnly session cookie. Contact an
                        administrator if you need access.
                    </p>
                </form>
            </section>
            <aside className={styles.authSide} aria-hidden="true">
                <div className={styles.authSideInner}>
                    <p className={styles.authSideKicker}>Nexora · Internal</p>
                    <p className={styles.authSideQuote}>
                        “Every lead answered, every project on track, every
                        client looked after.”
                    </p>
                    <ul className={styles.authSideList}>
                        <li>Pipeline, support & delivery in one place</li>
                        <li>Live sync with the public website</li>
                        <li>Secure admin & staff sessions</li>
                    </ul>
                </div>
            </aside>
        </main>
    );
}
