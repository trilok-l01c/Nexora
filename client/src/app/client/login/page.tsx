"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useClientAuth } from "../ClientAuthContext";
import styles from "../portal.module.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";

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
                <div className={styles.brand}>
                    <span className={styles.brandMark}>N</span> Nexora client
                    portal
                </div>
                <p className={styles.eyebrow}>Private workspace</p>
                <h1>Welcome back.</h1>
                <p className={styles.subtle}>
                    Sign in to follow your projects, updates, and support
                    requests.
                </p>
                <form onSubmit={submit}>
                    <label className={styles.field}>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            autoComplete="email"
                        />
                    </label>
                    <label className={styles.field}>
                        Password
                        <input
                            type="password"
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
                </form>
            </section>
        </main>
    );
}
