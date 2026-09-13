"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../portal.module.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";

type AccountData = {
    user?: {
        id: string;
        name: string;
        email: string;
        role: string;
        companyId?: string;
    };
    company?: { name: string };
};

export default function ClientAccount() {
    const router = useRouter();
    const [data, setData] = useState<AccountData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`${apiUrl}/api/client/dashboard`, { credentials: "include" })
            .then(async (response) => {
                const result = await response.json();
                if (response.status === 401 || response.status === 403) {
                    router.replace("/client/login");
                    return null;
                }
                if (!response.ok) throw new Error();
                return result.data as AccountData | undefined;
            })
            .then((result) => setData(result ?? {}))
            .catch(() => setError("Could not load account details."))
            .finally(() => setLoading(false));
    }, [router]);

    return (
        <section>
            <header className={styles.topbar}>
                <div>
                    <p className={styles.eyebrow}>Client workspace</p>
                    <h1 className={styles.title}>Account</h1>
                    <p className={styles.subtle}>
                        Your profile and company details.
                    </p>
                </div>
            </header>

            {loading ? (
                <p className={styles.subtle}>Loading…</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <div className={styles.overview}>
                    <div className={styles.overviewCell}>
                        <span className={styles.label}>Name</span>
                        <strong>{data?.user?.name ?? "—"}</strong>
                    </div>
                    <div className={styles.overviewCell}>
                        <span className={styles.label}>Email</span>
                        <strong>{data?.user?.email ?? "—"}</strong>
                    </div>
                    <div className={styles.overviewCell}>
                        <span className={styles.label}>Company</span>
                        <strong>{data?.company?.name ?? "—"}</strong>
                    </div>
                    <div className={styles.overviewCell}>
                        <span className={styles.label}>Role</span>
                        <strong>{data?.user?.role ?? "—"}</strong>
                    </div>
                </div>
            )}
        </section>
    );
}
