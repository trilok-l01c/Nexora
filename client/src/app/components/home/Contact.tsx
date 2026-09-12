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
    const [attachments, setAttachments] = useState<File[]>([]);

    function updateField(field: keyof typeof form, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function submitContact(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus("sending");
        setStatusMessage("");

        if (attachments.length > 5) {
            setStatus("error");
            setStatusMessage("You can attach up to 5 files.");
            return;
        }
        if (attachments.some((file) => file.size > 10 * 1024 * 1024)) {
            setStatus("error");
            setStatusMessage("Each attachment must be 10 MB or smaller.");
            return;
        }

        try {
            const payload = new FormData();
            Object.entries(form).forEach(([field, value]) =>
                payload.append(field, value),
            );
            attachments.forEach((file) => payload.append("attachments", file));
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292"}/api/contact`,
                {
                    method: "POST",
                    body: payload,
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
            setAttachments([]);
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
                        <span className={styles.fieldLabel}>
                            Name<span aria-hidden="true">*</span>
                        </span>
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
                        <span className={styles.fieldLabel}>
                            Email<span aria-hidden="true">*</span>
                        </span>
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
                        <span className={styles.fieldLabel}>Phone</span>
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
                        <span className={styles.fieldLabel}>Company</span>
                        <input
                            value={form.company}
                            onChange={(event) =>
                                updateField("company", event.target.value)
                            }
                            maxLength={120}
                        />
                    </label>
                    <label className={styles.formWide}>
                        <span className={styles.fieldLabel}>
                            What can we help with?
                            <span aria-hidden="true">*</span>
                        </span>
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
                        <span className={styles.fieldLabel}>
                            Project details<span aria-hidden="true">*</span>
                        </span>
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
                    <label className={styles.formWide}>
                        <span className={styles.fieldLabel}>
                            Share project detail in files
                        </span>
                        <input
                            className={styles.fileInput}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.webp"
                            onChange={(event) =>
                                setAttachments(
                                    Array.from(event.target.files || []),
                                )
                            }
                        />
                        <small className={styles.fileHint}>
                            Optional. Up to 5 files, 10 MB each.
                            {attachments.length > 0
                                ? ` ${attachments.length} selected.`
                                : ""}
                        </small>
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
