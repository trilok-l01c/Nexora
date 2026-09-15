"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../../apiConfig";
import { useClientAuth } from "../ClientAuthContext";
import styles from "../portal.module.css";

type AccountUser = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    companyId?: string;
    createdAt?: string;
};

type AccountData = {
    user?: AccountUser;
    company?: { name: string; createdAt?: string };
};

function fmtDate(value?: string) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ClientAccount() {
    const router = useRouter();
    const auth = useClientAuth();
    const [data, setData] = useState<AccountData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [saving, setSaving] = useState(false);
    const [okMsg, setOkMsg] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [loggingOut, setLoggingOut] = useState(false);

    const load = useCallback((): Promise<void> => {
        return fetch(`${apiUrl}/api/client/account`, { credentials: "include" })
            .then(async (response) => {
                const result = await response.json();
                if (response.status === 401 || response.status === 403) {
                    router.replace("/client/login");
                    return;
                }
                if (!response.ok) throw new Error(result.message || "Could not load account details.");
                const account = result.data as AccountData;
                setData(account);
                setName(account.user?.name ?? "");
                setPhone(account.user?.phone ?? "");
            })
            .catch((e: unknown) => {
                setError(e instanceof Error ? e.message : "Could not load account details.");
            })
            .finally(() => setLoading(false));
    }, [router]);

    // Promise-chained fetch: every setState runs inside a callback, never
    // synchronously in the effect body (same pattern as the dashboard pages).
    useEffect(() => {
        void load();
    }, [load]);

    function startEdit() {
        setOkMsg(""); setErrMsg("");
        setName(data?.user?.name ?? "");
        setPhone(data?.user?.phone ?? "");
        setEditing(true);
    }

    async function save(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const n = name.trim(); const p = phone.trim();
        if (n.length < 2 || n.length > 120) { setErrMsg("Please enter your full name (2 to 120 characters)."); return; }
        if (p && !/^[+()\-.\s\d]{6,32}$/.test(p)) { setErrMsg("Please enter a valid phone number."); return; }
        setSaving(true); setErrMsg(""); setOkMsg("");
        try {
            const res = await fetch(`${apiUrl}/api/client/account`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: n, phone: p }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Could not save changes.");
            setData((c) => ({ company: c?.company, user: result.data?.user ?? c?.user }));
            setEditing(false); setOkMsg("Profile updated.");
            await auth.refresh().catch(() => undefined);
        } catch (err) { setErrMsg(err instanceof Error ? err.message : "Could not save changes."); }
        finally { setSaving(false); }
    }

    async function doLogout() {
        setLoggingOut(true);
        await auth.logout();
        router.replace("/client/login");
    }

    return (
        <section>
            <header className={styles.topbar}>
                <div>
                    <p className={styles.eyebrow}>Client workspace</p>
                    <h1 className={styles.title}>Account</h1>
                    <p className={styles.subtle}>Your profile, company, and session details.</p>
                </div>
                {!editing && !loading && !error && (
                    <button type="button" className={styles.accountEditButton} onClick={startEdit}>Edit profile</button>
                )}
            </header>
            {loading ? (<p className={styles.subtle}>Loading...</p>)
            : error ? (<p className={styles.error}>{error}</p>)
            : editing ? (
                <form className={styles.accountCard} onSubmit={save}>
                    <h2 className={styles.sectionTitle}>Edit profile</h2>
                    <label className={styles.field}>Full name
                        <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={120} autoComplete="name" />
                    </label>
                    <label className={styles.field}>Phone number
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={32} autoComplete="tel" />
                    </label>
                    <label className={styles.field}>Email (cannot be changed)
                        <input value={data?.user?.email ?? ""} disabled />
                    </label>
                    {errMsg && <p className={styles.error}>{errMsg}</p>}
                    <div className={styles.accountFormActions}>
                        <button type="button" className={styles.secondaryButton} onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
                        <button type="submit" className={styles.button} disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
                    </div>
                </form>
            ) : (
                <>
                    {okMsg && <p className={styles.requestNotice}>{okMsg}</p>}
                    {errMsg && <p className={styles.error}>{errMsg}</p>}
                    <div className={styles.accountGrid}>
                        <div className={styles.accountCard}>
                            <h2 className={styles.sectionTitle}>Personal information</h2>
                            <dl className={styles.accountList}>
                                <div><dt>Name</dt><dd>{data?.user?.name || "—"}</dd></div>
                                <div><dt>Email</dt><dd>{data?.user?.email || "—"}</dd></div>
                                <div><dt>Phone</dt><dd>{data?.user?.phone || "—"}</dd></div>
                            </dl>
                        </div>
                        <div className={styles.accountCard}>
                            <h2 className={styles.sectionTitle}>Company</h2>
                            <dl className={styles.accountList}>
                                <div><dt>Company</dt><dd>{data?.company?.name || "—"}</dd></div>
                                <div><dt>Relationship</dt><dd>Client workspace member</dd></div>
                            </dl>
                        </div>
                        <div className={styles.accountCard}>
                            <h2 className={styles.sectionTitle}>Account</h2>
                            <dl className={styles.accountList}>
                                <div><dt>Role</dt><dd>{data?.user?.role || "—"}</dd></div>
                                <div><dt>Member since</dt><dd>{fmtDate(data?.user?.createdAt)}</dd></div>
                            </dl>
                        </div>
                        <div className={styles.accountCard}>
                            <h2 className={styles.sectionTitle}>Security</h2>
                            <p className={styles.subtle}>Password changes are handled by the Nexora team. Contact support for credential resets.</p>
                        </div>
                    </div>
                    <div className={styles.accountCard}>
                        <h2 className={styles.sectionTitle}>Session</h2>
                        <p className={styles.subtle}>Signed in as {data?.user?.email || "your account"}.</p>
                        <button type="button" className={styles.logout} onClick={doLogout} disabled={loggingOut}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            {loggingOut ? "Logging out..." : "Log out"}
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}
