"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { allServices } from "../services";
import styles from "./portal.module.css";

type ProjectForm = {
    name: string;
    description: string;
    serviceType: string;
    requirements: string;
    preferredStartDate: string;
    expectedBudget: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";
const initialForm: ProjectForm = {
    name: "",
    description: "",
    serviceType: "",
    requirements: "",
    preferredStartDate: "",
    expectedBudget: "",
};

export default function ProjectDialog() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<ProjectForm>(initialForm);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Escape closes the dialog (matching the auth dialog), and focus moves
    // to the close button on open so keyboard users start inside the modal.
    // Re-binding on `submitting` keeps the guard inside close() accurate.
    useEffect(() => {
        if (!open) return;
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") close();
        }
        document.addEventListener("keydown", handleKeyDown);
        const timer = window.setTimeout(() => {
            closeButtonRef.current?.focus();
        }, 30);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            window.clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- close() is stable per render; re-binding on submitting keeps its guard current
    }, [open, submitting]);

    function update(field: keyof ProjectForm, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function close() {
        if (!submitting) {
            setOpen(false);
            setMessage("");
        }
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitting(true);
        setMessage("");
        try {
            const response = await fetch(`${apiUrl}/api/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });
            const result = await response.json();
            if (response.status === 401 || response.status === 403) {
                router.replace("/client/login");
                return;
            }
            if (!response.ok)
                throw new Error(
                    result.message ||
                        "We could not submit this project request.",
                );
            setOpen(false);
            setForm(initialForm);
            router.push(`/client/projects/${result.data._id}`);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "We could not submit this project request.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <button
                className={styles.addProjectButton}
                type="button"
                onClick={() => setOpen(true)}
            >
                + Add Project
            </button>
            {open && (
                <div
                    className={styles.portalModalBackdrop}
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) close();
                    }}
                >
                    <section
                        className={styles.portalModal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="project-request-title"
                    >
                        <button
                            ref={closeButtonRef}
                            className={styles.portalModalClose}
                            type="button"
                            onClick={close}
                            aria-label="Close project request"
                        >
                            ×
                        </button>
                        <p className={styles.eyebrow}>New project request</p>
                        <h2 id="project-request-title">
                            Start something useful.
                        </h2>
                        <p className={styles.subtle}>
                            Tell the Nexora team what you want to move forward.
                            We will review the request before project work
                            begins.
                        </p>
                        <form onSubmit={submit}>
                            <label className={styles.field}>
                                Project name
                                <input
                                    value={form.name}
                                    onChange={(event) =>
                                        update("name", event.target.value)
                                    }
                                    required
                                    maxLength={160}
                                    placeholder="E-commerce website"
                                />
                            </label>
                            <label className={styles.field}>
                                Short description
                                <textarea
                                    value={form.description}
                                    onChange={(event) =>
                                        update(
                                            "description",
                                            event.target.value,
                                        )
                                    }
                                    required
                                    maxLength={1200}
                                    placeholder="What would you like Nexora to help you build?"
                                />
                            </label>
                            <label className={styles.field}>
                                Service type
                                <select
                                    value={form.serviceType}
                                    onChange={(event) =>
                                        update(
                                            "serviceType",
                                            event.target.value,
                                        )
                                    }
                                    required
                                >
                                    <option value="">Choose a service</option>
                                    {allServices.map((service) => (
                                        <option
                                            value={service.title}
                                            key={service.slug}
                                        >
                                            {service.title}
                                        </option>
                                    ))}
                                    <option value="Other">Other</option>
                                </select>
                            </label>
                            <label className={styles.field}>
                                Expected requirements
                                <textarea
                                    value={form.requirements}
                                    onChange={(event) =>
                                        update(
                                            "requirements",
                                            event.target.value,
                                        )
                                    }
                                    maxLength={5000}
                                    placeholder="Features, users, constraints, references, or expectations"
                                />
                            </label>
                            <div className={styles.projectFormGrid}>
                                <label className={styles.field}>
                                    Preferred start date
                                    <input
                                        type="date"
                                        value={form.preferredStartDate}
                                        onChange={(event) =>
                                            update(
                                                "preferredStartDate",
                                                event.target.value,
                                            )
                                        }
                                    />
                                </label>
                                <label className={styles.field}>
                                    Expected budget{" "}
                                    <span className={styles.optional}>
                                        Optional
                                    </span>
                                    <input
                                        value={form.expectedBudget}
                                        onChange={(event) =>
                                            update(
                                                "expectedBudget",
                                                event.target.value,
                                            )
                                        }
                                        maxLength={120}
                                        placeholder="e.g. 10,000 USD"
                                    />
                                </label>
                            </div>
                            <p
                                className={`${styles.message} ${message ? styles.error : ""}`}
                                aria-live="polite"
                            >
                                {message}
                            </p>
                            <button
                                className={styles.button}
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit project request"}
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </>
    );
}
