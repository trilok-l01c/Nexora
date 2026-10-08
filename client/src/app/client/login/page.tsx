"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useClientAuth } from "../ClientAuthContext";
import styles from "../portal.module.css";
import { apiUrl } from "../../apiConfig";

export default function ClientLogin() {
    const router = useRouter();
    const { refresh } = useClientAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.message || "Unable to sign in.");
            // Keep the shared session state in sync before leaving this page so
            // the portal navigation renders the signed-in layout immediately.
            await refresh().catch(() => undefined);
            router.replace("/client/dashboard");
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Unable to sign in.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className={styles.loginPage}>
            <section className={styles.loginCard}>
                <div className={styles.loginBrand}>
                    <span className={styles.brandMark}>N</span>
                    <span>Nexora <small>Client portal</small></span>
                </div>
                <p className={styles.loginKicker}>Private workspace</p>
                <h1>Your work, in one place.</h1>
                <p className={styles.subtle}>
                    Sign in to follow project progress, see updates, and get
                    support from the team.
                </p>
                <form onSubmit={submit}>
                    <label className={styles.field}>
                        <span>Work email</span>
                        <input
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            autoComplete="email"
                        />
                    </label>
                    <label className={styles.field}>
                        <span>Password</span>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                            minLength={8}
                            autoComplete="current-password"
                        />
                    </label>
                    <p
                        className={`${styles.message} ${message ? styles.error : ""}`}
                        aria-live="polite"
                    >
                        {message}
                    </p>
                    <button
                        className={styles.button}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in to portal"}
                    </button>
                    <p className={styles.loginFoot}>
                        Your workspace is protected with a secure session.
                    </p>
                </form>
            </section>
            <aside className={styles.loginAside} aria-hidden="true">
                <div className={styles.loginAsideInner}>
                    <p>Built for clear collaboration</p>
                    <h2>Stay close to the work that matters.</h2>
                    <ul>
                        <li>Track project progress in real time</li>
                        <li>Review delivery updates and milestones</li>
                        <li>Get help directly from the Nexora team</li>
                    </ul>
                </div>
            </aside>
        </main>
    );
}
