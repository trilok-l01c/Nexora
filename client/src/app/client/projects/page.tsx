"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../portal.module.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";

type Project = {
    _id: string;
    name: string;
    description: string;
    serviceType: string;
    status: string;
    progress: number;
    startDate?: string;
    expectedEndDate?: string;
};

export default function ClientProjects() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${apiUrl}/api/client/projects`, { credentials: "include" })
            .then(async (response) => {
                const result = await response.json();
                if (response.status === 401 || response.status === 403) {
                    router.replace("/client/login");
                    return null;
                }
                if (!response.ok) {
                    throw new Error("Could not load projects.");
                }
                return result.data as Project[];
            })
            .then((result) => result && setProjects(result))
            .catch(() =>
                setError("Could not load projects. Please try again."),
            )
            .finally(() => setLoading(false));
    }, [router]);

    return (
        <section>
            <header className={styles.topbar}>
                <div>
                    <p className={styles.eyebrow}>Client workspace</p>
                    <h1 className={styles.title}>My projects</h1>
                    <p className={styles.subtle}>
                        Track progress, updates, and support across every
                        Nexora project for your team.
                    </p>
                </div>
            </header>

            {loading ? (
                <p className={styles.subtle}>Loading projects…</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : projects.length === 0 ? (
                <div className={styles.emptyProjectState}>
                    <p className={styles.empty}>
                        No projects yet. Start your next project with Nexora.
                    </p>
                </div>
            ) : (
                <div className={styles.projectGrid}>
                    {projects.map((project) => (
                        <Link
                            key={project._id}
                            href={`/client/projects/${project._id}`}
                            className={styles.projectCard}
                        >
                            <span className={styles.projectTop}>
                                <strong>{project.name}</strong>
                                <span>{project.status}</span>
                            </span>
                            <p className={styles.projectDescription}>
                                {project.description}
                            </p>
                            <span className={styles.progressBar}>
                                <span
                                    style={{ width: `${project.progress}%` }}
                                />
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
