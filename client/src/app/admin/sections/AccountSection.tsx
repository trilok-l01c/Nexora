"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiUrl } from "../../apiConfig";
import { useClientAuth } from "../../client/ClientAuthContext";
import { Alert, Badge, ConfirmDialog } from "../components/primitives";

import styles from "../workspace.module.css";

type Health = { status: string; database: string };

export default function AccountSection({
    onSignOut,
}: {
    onSignOut: () => void;
}) {
    const { user, refresh } = useClientAuth();
    const [health, setHealth] = useState<Health | null>(null);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetch(`${apiUrl}/api/health`)
            .then((response) => response.json())
            .then((result) => {
                if (!cancelled) {
                    setHealth({
                        status: result.status || "unknown",
                        database: result.database || "unknown",
                    });
                }
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, []);

    const initials = (user?.email || "N").slice(0, 2);

    return (
        <div className={styles.stack}>
            <header className={styles.pageHeader}>
                <div>
                    <p className={styles.pageKicker}>Workspace</p>
                    <h1 className={styles.pageTitle}>Account &amp; Settings</h1>
                    <p className={styles.pageSubtitle}>
                        The admin account you are signed in with, plus the health
                        of the services this workspace depends on.
                    </p>
                </div>
            </header>

            <div className={styles.split}>
                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2 className={styles.panelTitle}>
                                Signed-in admin
                            </h2>
                            <p className={styles.panelHint}>
                                Your session is held in a secure HttpOnly
                                cookie and expires automatically.
                            </p>
                        </div>
                    </div>
                    <div className={styles.panelBody}>
                        <div
                            className={styles.sidebarUser}
                            style={{ marginBottom: 18 }}
                        >
                            <span className={styles.avatar}>{initials}</span>
                            <span className={styles.sidebarUserText}>
                                <strong>{user?.email || "Admin"}</strong>
                                <span>
                                    {user?.role === "admin"
                                        ? "Administrator"
                                        : "Staff"}
                                </span>
                            </span>
                        </div>

                        <div className={styles.kv}>
                            <span className={styles.kvLabel}>Email</span>
                            <span className={styles.kvValue}>
                                {user?.email || "—"}
                            </span>
                            <span className={styles.kvLabel}>Role</span>
                            <span className={styles.kvValue}>
                                <Badge tone="green">
                                    {user?.role === "admin"
                                        ? "Administrator"
                                        : "Staff"}
                                </Badge>
                            </span>
                            <span className={styles.kvLabel}>
                                Permissions
                            </span>
                            <span className={styles.kvValue}>
                                Full access to leads, projects, portfolio,
                                content, clients, and support queries.
                            </span>
                        </div>

                        <div
                            className={styles.btnRow}
                            style={{ marginTop: 18 }}
                        >
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnSecondary}`}
                                onClick={() => void refresh()}
                            >
                                Refresh session
                            </button>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnBlue}`}
                                onClick={() => setConfirming(true)}
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </section>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h2 className={styles.panelTitle}>System status</h2>
                    </div>
                    <div className={styles.panelBody}>
                        <div className={styles.kv}>
                            <span className={styles.kvLabel}>API</span>
                            <span className={styles.kvValue}>
                                <Badge
                                    tone={health?.status === "ok" ? "green" : "amber"}
                                    dot
                                >
                                    {health?.status === "ok" ? "Operational" : "Checking…"}
                                </Badge>
                            </span>
                            <span className={styles.kvLabel}>Database</span>
                            <span className={styles.kvValue}>
                                <Badge
                                    tone={
                                        health?.database === "connected"
                                            ? "green"
                                            : "amber"
                                    }
                                    dot
                                >
                                    {health
                                        ? health.database
                                        : "Checking…"}
                                </Badge>
                            </span>
                        </div>
                        <p className={styles.panelHint} style={{ marginTop: 14 }}>
                            {health?.database === "disconnected"
                                ? "The database is unreachable, so lead, project, and portfolio data cannot load right now."
                                : "All workspace data is loading normally."}
                        </p>
                    </div>
                </section>
            </div>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div>
                        <h2 className={styles.panelTitle}>Quick links</h2>
                        <p className={styles.panelHint}>
                            Jump between the internal workspace and the public
                            site.
                        </p>
                    </div>
                </div>
                <div className={styles.panelBody}>
                    <div className={styles.grid3}>
                        <Link className={styles.filterChip} href="/">
                            Public website
                        </Link>
                        <Link className={styles.filterChip} href="/portfolio">
                            Public portfolio
                        </Link>
                        <Link className={styles.filterChip} href="/client/login">
                            Client portal login
                        </Link>
                    </div>
                </div>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelBody}>
                    <Alert tone="blue">
                        <strong>Password changes are handled by the Nexora
                        team.</strong> Contact an administrator to rotate
                        credentials for admin and staff accounts.
                    </Alert>
                </div>
            </section>

            <ConfirmDialog
                open={confirming}
                title="Sign out of the workspace?"
                description="Your admin session cookie will be cleared and you will return to the sign-in screen. Nothing you have saved is affected."
                confirmLabel="Sign out"
                onCancel={() => setConfirming(false)}
                onConfirm={() => {
                    setConfirming(false);
                    onSignOut();
                }}
            />
        </div>
    );
}
