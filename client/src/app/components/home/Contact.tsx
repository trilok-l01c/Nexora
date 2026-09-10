"use client";

import { FormEvent, useState } from "react";
import styles from "./Contact.module.css";

export default function Contact() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        service: "",
        message: "",
    });
    const [status, setStatus] = useState<
        "idle" | "sending" | "success" | "error"
    >("idle");
    const [statusMessage, setStatusMessage] = useState("");

    function updateField(field: keyof typeof form, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function submitContact(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus("sending");
        setStatusMessage("");

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292"}/api/contact`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                },
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "We could not send your request.",
                );
            }

            setStatus("success");
            setStatusMessage(result.message);
            setForm({
                name: "",
                email: "",
                phone: "",
                company: "",
                service: "",
                message: "",
            });
        } catch (error) {
            setStatus("error");
            setStatusMessage(
                error instanceof Error
                    ? error.message
                    : "We could not send your request.",
            );
        }
    }

    return (
        <section className={styles.contact} id="contact">
            <p className={styles.kicker}>03 / Make a move</p>
            <h2>
                Have a good
                <br />
                <em>feeling</em> about this?
            </h2>
            <form className={styles.contactForm} onSubmit={submitContact}>
                <div className={styles.formGrid}>
                    <label>
                        Name <span>*</span>
                        <input
                            value={form.name}
                            onChange={(event) =>
                                updateField("name", event.target.value)
                            }
                            required
                            maxLength={100}
                        />
                    </label>
                    <label>
                        Email <span>*</span>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(event) =>
                                updateField("email", event.target.value)
                            }
                            required
                            maxLength={254}
                        />
                    </label>
                    <label>
                        Phone
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(event) =>
                                updateField("phone", event.target.value)
                            }
                            maxLength={30}
                        />
                    </label>
                    <label>
                        Company
                        <input
                            value={form.company}
                            onChange={(event) =>
                                updateField("company", event.target.value)
                            }
                            maxLength={120}
                        />
                    </label>
                    <label className={styles.formWide}>
                        What can we help with? <span>*</span>
                        <select
                            value={form.service}
                            onChange={(event) =>
                                updateField("service", event.target.value)
                            }
                            required
                        >
                            <option value="">Select a service</option>
                            <option>Software development</option>
                            <option>Cloud & infrastructure</option>
                            <option>IT support & maintenance</option>
                            <option>AI systems</option>
                            <option>Data analysis</option>
                            <option>Digital presence</option>
                        </select>
                    </label>
                    <label className={styles.formWide}>
                        Project details <span>*</span>
                        <textarea
                            value={form.message}
                            onChange={(event) =>
                                updateField("message", event.target.value)
                            }
                            required
                            maxLength={5000}
                            rows={5}
                        />
                    </label>
                </div>
                <div className={styles.formFooter}>
                    <p
                        className={styles.formStatus}
                        data-status={status}
                        aria-live="polite"
                    >
                        {statusMessage}
                    </p>
                    <button
                        className={styles.contactButton}
                        type="submit"
                        disabled={status === "sending"}
                    >
                        {status === "sending" ? "Sending..." : "Send enquiry"}{" "}
                        <span aria-hidden="true">↗</span>
                    </button>
                </div>
            </form>
            <a
                className={styles.contactButton}
                href="mailto:hello@nexora.studio"
            >
                hello@nexora.studio <span>↗</span>
            </a>
        </section>
    );
}
