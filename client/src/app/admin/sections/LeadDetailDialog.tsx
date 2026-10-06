"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAdminData } from "../AdminDataContext";
import { adminJson } from "../adminApi";
import {
    LEAD_STATUS_LABELS,
    MANUAL_LEAD_STATUSES,
    type Lead,
    type LeadStatus,
} from "../adminTypes";
import { Alert, Field, LeadStatusBadge } from "../components/primitives";
import { CloseIcon } from "../components/icons";
import styles from "../workspace.module.css";

type ApiResult<T> = { success: boolean; data: T; message?: string };

type LeadForm = {
    name: string;
    email: string;
    phone: string;
    company: string;
    service: string;
};

type ConversionForm = {
    companyName: string;
    clientName: string;
    email: string;
    phone: string;
    password: string;
};

function leadFormFrom(lead: Lead): LeadForm {
    return {
        name: lead.name,
        email: lead.email,
        phone: lead.phone || "",
        company: lead.company || "",
        service: lead.service,
    };
}

function conversionFrom(lead: Lead): ConversionForm {
    return {
        companyName: lead.company || "",
        clientName: lead.name,
        email: lead.email,
        phone: lead.phone || "",
        password: "",
    };
}

export default function LeadDetailDialog({
    lead,
    onClose,
}: {
    lead: Lead;
    onClose: () => void;
}) {
    const { loadLeads } = useAdminData();
    const [form, setForm] = useState<LeadForm>(() => leadFormFrom(lead));
    const [conversion, setConversion] = useState<ConversionForm>(() =>
        conversionFrom(lead),
    );
    const [noteText, setNoteText] = useState("");
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteText, setEditingNoteText] = useState("");
    const [showConvert, setShowConvert] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [tone, setTone] = useState<"green" | "red">("green");

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !busy) onClose();
        };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onClose, busy]);

    function report(text: string, nextTone: "green" | "red" = "green") {
        setMessage(text);
        setTone(nextTone);
    }

    // The shared list is the source of truth, so every mutation refreshes it and
    // this dialog re-renders from the updated lead.
    const refresh = loadLeads;

    async function saveContactDetails() {
        setBusy(true);
        const body: Record<string, string> = {};
        if (form.name !== lead.name) body.name = form.name;
        if (form.email !== lead.email) body.email = form.email;
        if (form.phone !== (lead.phone || "")) body.phone = form.phone;
        if (form.company !== (lead.company || "")) body.company = form.company;
        if (form.service !== lead.service) body.service = form.service;
        if (Object.keys(body).length === 0) {
            report("No contact changes to save.", "red");
            setBusy(false);
            return;
        }
        try {
            await adminJson(`/api/admin/leads/${lead._id}`, "PATCH", body);
            await refresh();
            report("Lead details saved.");
        } catch (error) {
            report(
                error instanceof Error
                    ? error.message
                    : "Could not update lead.",
                "red",
            );
        } finally {
            setBusy(false);
        }
    }

    async function changeStatus(status: LeadStatus) {
        setBusy(true);
        try {
            await adminJson(`/api/admin/leads/${lead._id}/status`, "PATCH", {
                status,
            });
            await refresh();
            report(
                `Lead status updated to ${LEAD_STATUS_LABELS[status].toLowerCase()}.`,
            );
        } catch (error) {
            report(
                error instanceof Error
                    ? error.message
                    : "Could not update lead status.",
                "red",
            );
        } finally {
            setBusy(false);
        }
    }

    async function submitNote(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!noteText.trim()) return;
        setBusy(true);
        try {
            await adminJson(`/api/admin/leads/${lead._id}/notes`, "POST", {
                text: noteText,
            });
            setNoteText("");
            await refresh();
            report("Note added.");
        } catch (error) {
            report(
                error instanceof Error ? error.message : "Could not add note.",
                "red",
            );
        } finally {
            setBusy(false);
        }
    }

    async function saveNoteEdit(noteId: string) {
        setBusy(true);
        try {
            await adminJson(
                `/api/admin/leads/${lead._id}/notes/${noteId}`,
                "PATCH",
                { text: editingNoteText },
            );
            setEditingNoteId(null);
            await refresh();
            report("Note updated.");
        } catch (error) {
            report(
                error instanceof Error
                    ? error.message
                    : "Could not update note.",
                "red",
            );
        } finally {
            setBusy(false);
        }
    }

    async function submitConversion(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        try {
            const result = await adminJson<
                ApiResult<{
                    lead: Lead;
                    company: { id: string; name: string };
                    user: { email: string };
                }>
            >(`/api/admin/leads/${lead._id}/convert`, "POST", conversion);
            setConversion((current) => ({ ...current, password: "" }));
            setShowConvert(false);
            await refresh();
            report(
                `${result.message} Portal account: ${result.data.user.email} (${result.data.company.name}). Share the password with the client securely.`,
            );
        } catch (error) {
            report(
                error instanceof Error
                    ? error.message
                    : "Could not convert this lead.",
                "red",
            );
        } finally {
            setBusy(false);
        }
    }

    const notes = [...(lead.notes || [])].sort(
        (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime(),
    );
    const converted = Boolean(lead.convertedAt);

    return (
        <div
            className={styles.dialogBackdrop}
            role="presentation"
            onClick={busy ? undefined : onClose}
        >
            <div
                className={`${styles.dialog} ${styles.dialogWide}`}
                role="dialog"
                aria-modal="true"
                aria-label={`Lead from ${lead.name}`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className={styles.dialogHeader}>
                    <div>
                        <h2 className={styles.dialogTitle}>{lead.name}</h2>
                        <p className={styles.dialogSubtitle}>
                            {lead.email}
                            {lead.company ? ` · ${lead.company}` : ""}
                            {lead.phone ? ` · ${lead.phone}` : ""}
                        </p>
                    </div>
                    <div className={styles.btnRow}>
                        <LeadStatusBadge status={lead.status} />
                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={onClose}
                            disabled={busy}
                            aria-label="Close lead"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                <div className={styles.dialogBody}>
                    <div className={styles.stackTight}>
                        {message ? (
                            <Alert tone={tone === "green" ? "green" : "red"}>
                                {message}
                            </Alert>
                        ) : null}

                        {converted ? (
                            <Alert tone="green">
                                Converted to client on{" "}
                                {new Date(
                                    lead.convertedAt as string,
                                ).toLocaleString()}
                                . This client can now sign in to the portal.
                            </Alert>
                        ) : null}
                        <div className={styles.grid2}>
                            <Field label="Name">
                                <input
                                    className={styles.input}
                                    value={form.name}
                                    maxLength={100}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            name: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Email">
                                <input
                                    className={styles.input}
                                    type="email"
                                    value={form.email}
                                    maxLength={254}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            email: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Phone">
                                <input
                                    className={styles.input}
                                    type="tel"
                                    value={form.phone}
                                    maxLength={30}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            phone: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Company">
                                <input
                                    className={styles.input}
                                    value={form.company}
                                    maxLength={120}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            company: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Service">
                                <input
                                    className={styles.input}
                                    value={form.service}
                                    maxLength={120}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            service: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            {!converted ? (
                                <Field
                                    label="Status"
                                    hint="Converted is only set by the conversion form below."
                                >
                                    <select
                                        className={styles.select}
                                        value={lead.status}
                                        disabled={busy}
                                        aria-label={`Update status for ${lead.name}`}
                                        onChange={(event) =>
                                            void changeStatus(
                                                event.target
                                                    .value as LeadStatus,
                                            )
                                        }
                                    >
                                        {MANUAL_LEAD_STATUSES.map((status) => (
                                            <option
                                                key={status}
                                                value={status}
                                            >
                                                {LEAD_STATUS_LABELS[status]}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            ) : null}
                        </div>
                        <div className={styles.btnRow}>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                onClick={() => void saveContactDetails()}
                                disabled={busy}
                            >
                                Save contact details
                            </button>
                        </div>

                        <div className={styles.panel}>
                            <div className={styles.panelBody}>
                                <div className={styles.kv}>
                                    <span className={styles.kvLabel}>
                                        Requirement
                                    </span>
                                    <span className={styles.kvValue}>
                                        {lead.message}
                                    </span>
                                    <span className={styles.kvLabel}>Source</span>
                                    <span className={styles.kvValue}>
                                        {lead.source}
                                    </span>
                                    <span className={styles.kvLabel}>
                                        Received
                                    </span>
                                    <span className={styles.kvValue}>
                                        {new Date(
                                            lead.createdAt,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submitNote}>
                            <div className={styles.stackTight}>
                                <Field
                                    label="Add a follow-up note"
                                    hint="Internal only. Recorded on the lead timeline."
                                >
                                    <textarea
                                        className={styles.textarea}
                                        value={noteText}
                                        maxLength={2000}
                                        placeholder="Called them, sent a quote, booked a discovery call…"
                                        onChange={(event) =>
                                            setNoteText(event.target.value)
                                        }
                                    />
                                </Field>
                                <div className={styles.btnRow}>
                                    <button
                                        type="submit"
                                        className={`${styles.btn} ${styles.btnSecondary}`}
                                        disabled={busy || !noteText.trim()}
                                    >
                                        Save note
                                    </button>
                                </div>
                            </div>
                        </form>
                        <div>
                            <p className={styles.panelTitle}>
                                Relationship history
                            </p>
                            {notes.length === 0 ? (
                                <p className={styles.panelHint}>
                                    No notes or status changes recorded yet.
                                </p>
                            ) : (
                                <ul className={styles.timeline}>
                                    {notes.map((note) => (
                                        <li
                                            key={note._id}
                                            className={styles.timelineItem}
                                            data-type={note.type}
                                        >
                                            <div className={styles.timelineTop}>
                                                <span className={styles.badge}>
                                                    {note.type === "note"
                                                        ? "Note"
                                                        : note.type === "status"
                                                          ? "Status update"
                                                          : "Converted"}
                                                </span>
                                                <span
                                                    className={
                                                        styles.timelineTime
                                                    }
                                                >
                                                    {new Date(
                                                        note.createdAt,
                                                    ).toLocaleString()}
                                                    {note.authorName
                                                        ? ` · ${note.authorName}`
                                                        : ""}
                                                </span>
                                            </div>
                                            {editingNoteId === note._id ? (
                                                <div className={styles.stackTight}>
                                                    <textarea
                                                        className={
                                                            styles.textarea
                                                        }
                                                        value={
                                                            editingNoteText
                                                        }
                                                        maxLength={2000}
                                                        rows={3}
                                                        onChange={(event) =>
                                                            setEditingNoteText(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                    <div
                                                        className={
                                                            styles.btnRow
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                                                            disabled={busy}
                                                            onClick={() =>
                                                                void saveNoteEdit(
                                                                    note._id,
                                                                )
                                                            }
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                                                            disabled={busy}
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
                                                    <p
                                                        className={
                                                            styles.timelineText
                                                        }
                                                    >
                                                        {note.text}
                                                    </p>
                                                    {note.type === "note" ? (
                                                        <div
                                                            className={
                                                                styles.timelineActions
                                                            }
                                                        >
                                                            <button
                                                                type="button"
                                                                className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                                                                disabled={busy}
                                                                onClick={() => {
                                                                    setEditingNoteId(
                                                                        note._id,
                                                                    );
                                                                    setEditingNoteText(
                                                                        note.text,
                                                                    );
                                                                }}
                                                            >
                                                                Edit note
                                                            </button>
                                                        </div>
                                                    ) : null}
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {!converted ? (
                            <div className={styles.dangerZone}>
                                <div className={styles.dangerZoneHeader}>
                                    <h3 className={styles.dangerZoneTitle}>
                                        Convert to client
                                    </h3>
                                    <p className={styles.dangerZoneHint}>
                                        Creates a client account for this lead,
                                        reusing an existing company with the
                                        same name. Share the initial password
                                        with the client securely — Nexora does
                                        not send emails automatically.
                                    </p>
                                </div>
                                <div className={styles.dangerZoneBody}>
                                    {!showConvert ? (
                                        <button
                                            type="button"
                                            className={`${styles.btn} ${styles.btnSecondary}`}
                                            onClick={() => setShowConvert(true)}
                                        >
                                            Start conversion
                                        </button>
                                    ) : (
                                        <form
                                            onSubmit={submitConversion}
                                            className={styles.stackTight}
                                            style={{ width: "100%" }}
                                        >
                                            <div className={styles.grid2}>
                                                <Field label="Company name">
                                                    <input
                                                        className={
                                                            styles.input
                                                        }
                                                        value={
                                                            conversion.companyName
                                                        }
                                                        maxLength={160}
                                                        required
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
                                                    />
                                                </Field>
                                                <Field label="Client name">
                                                    <input
                                                        className={
                                                            styles.input
                                                        }
                                                        value={
                                                            conversion.clientName
                                                        }
                                                        maxLength={120}
                                                        required
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
                                                    />
                                                </Field>
                                                <Field label="Client email">
                                                    <input
                                                        className={
                                                            styles.input
                                                        }
                                                        type="email"
                                                        value={conversion.email}
                                                        maxLength={254}
                                                        required
                                                        onChange={(event) =>
                                                            setConversion(
                                                                (current) => ({
                                                                    ...current,
                                                                    email: event.target
                                                                        .value,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                </Field>
                                                <Field label="Client phone">
                                                    <input
                                                        className={
                                                            styles.input
                                                        }
                                                        type="tel"
                                                        value={conversion.phone}
                                                        maxLength={30}
                                                        onChange={(event) =>
                                                            setConversion(
                                                                (current) => ({
                                                                    ...current,
                                                                    phone: event.target
                                                                        .value,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                </Field>
                                            </div>
                                            <Field
                                                label="Initial portal password"
                                                hint="Minimum 8 characters. Share it with the client out of band."
                                            >
                                                <input
                                                    className={
                                                        styles.input
                                                    }
                                                    type="password"
                                                    value={
                                                        conversion.password
                                                    }
                                                    minLength={8}
                                                    required
                                                    autoComplete="new-password"
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
                                                />
                                            </Field>
                                            <div
                                                className={styles.btnRow}
                                            >
                                                <button
                                                    type="submit"
                                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                                    disabled={busy}
                                                >
                                                    Create client account
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`${styles.btn} ${styles.btnGhost}`}
                                                    disabled={busy}
                                                    onClick={() =>
                                                        setShowConvert(false)
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className={styles.dialogFooter}>
                    <span className={styles.spinnerText}>
                        Lead received {new Date(lead.createdAt).toLocaleDateString("en-GB")}
                    </span>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={onClose}
                        disabled={busy}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}