"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../portal.module.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";

type Ticket = {
    number: number;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
};

export default function ClientSupport() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [ticket, setTicket] = useState({
        subject: "",
        description: "",
        priority: "Normal",
    });
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch(`${apiUrl}/api/client/dashboard`, { credentials: "include" })
            .then(async (response) => {
                const result = await response.json();
                if (response.status === 401 || response.status === 403) {
                    router.replace("/client/login");
                    return null;
                }
                if (!response.ok) throw new Error();
                return result.data?.tickets as Ticket[] | undefined;
            })
            .then((result) => setTickets(result ?? []))
            .catch(() => setError("Could not load support tickets."))
            .finally(() => setLoading(false));
    }, [router]);

    async function submitTicket(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitting(true);
        setMessage("");
        try {
            const response = await fetch(`${apiUrl}/api/client/tickets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(ticket),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Could not create request.");
            }
            setTicket({ subject: "", description: "", priority: "Normal" });
            setMessage(`Ticket #${result.data.number} created.`);
            const dashResponse = await fetch(
                `${apiUrl}/api/client/dashboard`,
                { credentials: "include" },
            );
            const dashResult = await dashResponse.json();
            if (dashResponse.ok) setTickets(dashResult.data?.tickets ?? []);
        } catch (requestError) {
            setMessage(
                requestError instanceof Error
                    ? requestError.message
                    : "Could not create request.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section>
            <header className={styles.topbar}>
                <div>
                    <p className={styles.eyebrow}>Client workspace</p>
                    <h1 className={styles.title}>Support</h1>
                    <p className={styles.subtle}>
                        Raise a support request and follow existing tickets.
                    </p>
                </div>
            </header>
            <div className={styles.lowerGrid}>
                <div>
                    <h2 className={styles.sectionTitle}>Your tickets</h2>
                    {loading ? (
                        <p className={styles.subtle}>Loading…</p>
                    ) : error ? (
                        <p className={styles.error}>{error}</p>
                    ) : tickets.length === 0 ? (
                        <p className={styles.subtle}>No tickets yet.</p>
                    ) : (
                        <div className={styles.updateList}>
                            {tickets.map((t) => (
                                <div key={t.number} className={styles.update}>
                                    <div className={styles.updateMeta}>
                                        <span>#{t.number}</span>
                                        <time>{t.createdAt}</time>
                                    </div>
                                    <h3>{t.subject}</h3>
                                    <span className={styles.badge}>
                                        {t.status} · {t.priority}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <h2 className={styles.sectionTitle}>New request</h2>
                    <form onSubmit={submitTicket}>
                        <div className={styles.field}>
                            <span>Subject</span>
                            <input
                                value={ticket.subject}
                                onChange={(e) =>
                                    setTicket((c) => ({
                                        ...c,
                                        subject: e.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <span>Description</span>
                            <textarea
                                rows={5}
                                value={ticket.description}
                                onChange={(e) =>
                                    setTicket((c) => ({
                                        ...c,
                                        description: e.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <span>Priority</span>
                            <select
                                value={ticket.priority}
                                onChange={(e) =>
                                    setTicket((c) => ({
                                        ...c,
                                        priority: e.target.value,
                                    }))
                                }
                            >
                                <option value="Low">Low</option>
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                        {message && (
                            <p
                                className={
                                    message.startsWith("Ticket")
                                        ? styles.requestNotice
                                        : styles.error
                                }
                            >
                                {message}
                            </p>
                        )}
                        <button
                            type="submit"
                            className={styles.button}
                            disabled={submitting}
                        >
                            {submitting ? "Submitting…" : "Submit request"}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}