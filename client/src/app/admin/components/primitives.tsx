"use client";

import { useEffect, type ReactNode } from "react";
import { LEAD_STATUS_LABELS, type LeadStatus } from "../adminTypes";
import { AlertIcon, CheckIcon, CloseIcon, InboxIcon } from "./icons";
import styles from "../workspace.module.css";

type Tone = "neutral" | "green" | "blue" | "amber" | "red";

const toneClass: Record<Tone, string> = {
    neutral: "",
    green: "badgeGreen",
    blue: "badgeBlue",
    amber: "badgeAmber",
    red: "badgeRed",
};export function Badge({
    tone = "neutral",
    dot = false,
    children,
}: {
    tone?: Tone;
    dot?: boolean;
    children: ReactNode;
}) {
    const toneKey = toneClass[tone];
    const className = [styles.badge, dot ? styles.badgeDot : "", toneKey ? (styles as Record<string,string>)[toneKey] : ""]
        .filter(Boolean)
        .join(" ");
    return <span className={className}>{children}</span>;
}

const leadTone: Record<LeadStatus, Tone> = {
    new: "blue",
    contacted: "amber",
    in_progress: "green",
    completed: "green",
    rejected: "red",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
    return (
        <Badge tone={leadTone[status]} dot>
            {LEAD_STATUS_LABELS[status]}
        </Badge>
    );
}

// Project status is a free-form enum on the server, so the tone is derived from
// the name rather than stored per value.
export function projectTone(status: string): Tone {
    if (status === "Completed") return "green";
    if (status === "On Hold") return "amber";
    if (status === "Requested" || status === "Pending Review") return "blue";
    return "neutral";
}

export function ProjectStatusBadge({ status }: { status: string }) {
    return (
        <Badge tone={projectTone(status)} dot>
            {status}
        </Badge>
    );
}

const ticketTone: Record<string, Tone> = {
    Open: "blue",
    "In Progress": "amber",
    Resolved: "green",
    Urgent: "red",
    High: "amber",
    Low: "neutral",
    Normal: "neutral",
};

export function TicketBadge({
    label,
    kind,
}: {
    label: string;
    kind: "status" | "priority";
}) {
    return (
        <Badge
            tone={ticketTone[label] ?? "neutral"}
            dot={kind === "status"}
        >
            {label}
        </Badge>
    );
}

export function ProgressBar({
    value,
    tone = "green",
}: {
    value: number;
    tone?: "green" | "blue";
}) {
    const clamped = Math.max(0, Math.min(100, Number(value) || 0));
    return (
        <div className={styles.progressInline}>
            <div
                className={styles.progress}
                role="progressbar"
                aria-valuenow={clamped}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className={`${styles.progressBar} ${
                        tone === "blue" ? styles.progressBarBlue : ""
                    }`}
                    style={{ width: `${clamped}%` }}
                />
            </div>
            <span>{clamped}%</span>
        </div>
    );
}

export function Alert({
    tone = "neutral",
    children,
}: {
    tone?: Tone;
    children: ReactNode;
}) {
    const toneClassName =
        tone === "green"
            ? styles.alertSuccess
            : tone === "red"
              ? styles.alertError
              : tone === "blue"
                ? styles.alertInfo
                : "";
    return (
        <div className={`${styles.alert} ${toneClassName}`} aria-live="polite">
            {tone === "green" ? (
                <CheckIcon />
            ) : tone === "red" ? (
                <AlertIcon />
            ) : null}
            <span>{children}</span>
        </div>
    );
}

export function EmptyState({
    title,
    hint,
    action,
}: {
    title: string;
    hint?: string;
    action?: ReactNode;
}) {
    return (
        <div className={styles.empty}>
            <div className={styles.emptyIcon}>
                <InboxIcon />
            </div>
            <p className={styles.emptyTitle}>{title}</p>
            {hint ? <p className={styles.emptyText}>{hint}</p> : null}
            {action ? (
                <div
                    className={styles.btnRow}
                    style={{ justifyContent: "center", marginTop: 16 }}
                >
                    {action}
                </div>
            ) : null}
        </div>
    );
}

export function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <label className={styles.field}>
            <span className={styles.fieldLabel}>{label}</span>
            {children}
            {hint ? <span className={styles.fieldHint}>{hint}</span> : null}
        </label>
    );
}

// A single, consistent confirmation surface for every destructive action. Escape
// closes it, the backdrop closes it, and cancel is auto-focused so a stray Enter
// cannot delete anything.
export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Delete",
    busy = false,
    onCancel,
    onConfirm,
}: {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    busy?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !busy) onCancel();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onCancel, busy]);

    if (!open) return null;

    return (
        <div
            className={styles.dialogBackdrop}
            role="presentation"
            onClick={busy ? undefined : onCancel}
        >
            <div
                className={styles.dialog}
                role="alertdialog"
                aria-modal="true"
                aria-label={title}
                onClick={(event) => event.stopPropagation()}
            >
                <div className={styles.dialogHeader}>
                    <h2 className={styles.dialogTitle}>{title}</h2>
                    <button
                        type="button"
                        className={styles.iconButton}
                        onClick={onCancel}
                        disabled={busy}
                        aria-label="Close"
                    >
                        <CloseIcon />
                    </button>
                </div>
                <div className={styles.dialogBody}>
                    <p className={styles.dialogCopy}>{description}</p>
                </div>
                <div className={styles.dialogFooter}>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={onCancel}
                        disabled={busy}
                        autoFocus
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnDanger}`}
                        onClick={onConfirm}
                        disabled={busy}
                    >
                        {busy ? "Working..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
