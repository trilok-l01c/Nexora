"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProjectDialog from "../ProjectDialog";
import styles from "../portal.module.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";
type TechnologyGroup = { category: string; items: string[] };
type Project = {
    _id: string;
    name: string;
    description: string;
    serviceType: string;
    status: string;
    progress: number;
    startDate?: string;
    expectedEndDate?: string;
    technologies: TechnologyGroup[];
};
type Activity = {
    _id: string;
    text: string;
    projectName: string;
    createdAt: string;
    actor: string;
};
type Ticket = {
    number: number;
    subject: string;
    status: string;
    priority: string;
};
type DashboardData = {
    company?: { name: string };
    projects: Project[];
    activity: Activity[];
    tickets: Ticket[];
};

function date(value?: string) {
    return value
        ? new Date(value).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : "Not scheduled";
}

export default function ClientDashboard() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState("");
    const [ticket, setTicket] = useState({
        subject: "",
        description: "",
        priority: "Normal",
        projectId: "",
    });
    const [ticketMessage, setTicketMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch(`${apiUrl}/api/client/dashboard`, { credentials: "include" })
            .then(async (response) => {
                const result = await response.json();
                if (response.status === 401 || response.status === 403) {
                    router.replace("/client/login");
                    return null;
                }
                if (!response.ok)
                    throw new Error(
                        "We could not load your project workspace.",
                    );
                return result.data as DashboardData;
            })
            .then((result) => result && setData(result))
            .catch(() =>
                setError(
                    "We could not load your project workspace. Please try again.",
                ),
            );
    }, [router]);

    async function submitTicket(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitting(true);
        setTicketMessage("");
        try {
            const response = await fetch(`${apiUrl}/api/client/tickets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(ticket),
            });
            const result = await response.json();
            if (!response.ok)
                throw new Error(
                    result.message || "Could not create support request.",
                );
            setTicket({
                subject: "",
                description: "",
                priority: "Normal",
                projectId: "",
            });
            setTicketMessage(
                `Ticket #${result.data.number} created. Status: ${result.data.status}.`,
            );
        } catch (requestError) {
            setTicketMessage(
                requestError instanceof Error
                    ? requestError.message
                    : "Could not create support request.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    if (!data && !error)
        return (
            <>
                <p className={styles.eyebrow}>Client portal</p>
                <h1 className={styles.title}>Loading your workspace...</h1>
            </>
        );
    if (error)
        return (
            <>
                <p className={`${styles.message} ${styles.error}`}>{error}</p>
                <Link className={styles.button} href="/client/login">
                    Return to sign in
                </Link>
            </>
        );

    const projects = data?.projects || [];
    const active = projects.filter(
        (project) => project.status !== "Completed",
    ).length;
    const completed = projects.length - active;
    const current =
        projects.find((project) => project.status !== "Completed")?.status ||
        "All projects complete";
    return (
        <>
            <div id="dashboard">
                <header className={styles.topbar}>
                    <div>
                        <p className={styles.eyebrow}>Client workspace</p>
                        <h1 className={styles.title}>
                            Good morning, {data?.company?.name || "there"}
                        </h1>
                        <p className={styles.subtle}>
                            A clear view of everything Nexora is moving forward
                            for you.
                        </p>
                    </div>
                    <time className={styles.date}>
                        {date(new Date().toISOString())}
                    </time>
                </header>
                <section
                    className={styles.overview}
                    aria-label="Project overview"
                >
                    <div className={styles.overviewCell}>
                        <span className={styles.label}>Current status</span>
                        <strong>{current}</strong>
                    </div>
                    <div className={styles.overviewCell}>
                        <span className={styles.label}>Active projects</span>
                        <strong>{active}</strong>
                    </div>
                    <div className={styles.overviewCell}>
                        <span className={styles.label}>Completed</span>
                        <strong>{completed}</strong>
                    </div>
                    <div className={styles.overviewCell}>
                        <span className={styles.label}>Recent update</span>
                        <strong>
                            {data?.activity[0]
                                ? date(data.activity[0].createdAt)
                                : "None yet"}
                        </strong>
                    </div>
                </section>
                <section id="projects">
                    <div className={styles.sectionHeader}>
                        <div>
                            <p className={styles.eyebrow}>Portfolio</p>
                            <h2 className={styles.sectionTitle}>My projects</h2>
                        </div>
                        <ProjectDialog />
                    </div>
                    {projects.length === 0 ? (
                        <div className={styles.emptyProjectState}>
                            <p className={styles.empty}>
                                No projects yet. Start your next project with
                                Nexora.
                            </p>
                            <ProjectDialog />
                        </div>
                    ) : (
                        <div className={styles.projectGrid}>
                            {projects.map((project) => (
                                <Link
                                    className={styles.projectCard}
                                    href={`/client/projects/${project._id}`}
                                    key={project._id}
                                >
                                    <div className={styles.projectTop}>
                                        <div>
                                            <h3 className={styles.projectName}>
                                                {project.name}
                                            </h3>
                                            <p className={styles.subtle}>
                                                {project.serviceType}
                                            </p>
                                        </div>
                                        <span className={styles.badge}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className={styles.progressMeta}>
                                        <span>Progress</span>
                                        <strong>{project.progress}%</strong>
                                    </p>
                                    <div className={styles.progressTrack}>
                                        <div
                                            className={styles.progressBar}
                                            style={{
                                                width: `${project.progress}%`,
                                            }}
                                        />
                                    </div>
                                    <div className={styles.projectFacts}>
                                        <div>
                                            <span className={styles.label}>
                                                Started
                                            </span>
                                            <span className={styles.factValue}>
                                                {date(project.startDate)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={styles.label}>
                                                Expected
                                            </span>
                                            <span className={styles.factValue}>
                                                {date(project.expectedEndDate)}
                                            </span>
                                        </div>
                                    </div>
                                    <p className={styles.techLine}>
                                        {project.technologies
                                            ?.flatMap((group) => group.items)
                                            .join(" · ") ||
                                            "Technology stack to be confirmed"}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
                <div className={styles.lowerGrid}>
                    <section>
                        <div className={styles.sectionHeader}>
                            <div>
                                <p className={styles.eyebrow}>Signal</p>
                                <h2 className={styles.sectionTitle}>
                                    Recent activity
                                </h2>
                            </div>
                        </div>
                        <div className={styles.activity}>
                            {data?.activity.length ? (
                                data.activity.map((item) => (
                                    <div
                                        className={styles.activityItem}
                                        key={item._id}
                                    >
                                        <time>{date(item.createdAt)}</time>
                                        <span>
                                            <strong>{item.text}</strong>
                                            <br />
                                            <span className={styles.subtle}>
                                                {item.projectName} ·{" "}
                                                {item.actor}
                                            </span>
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.empty}>
                                    No project activity yet.
                                </p>
                            )}
                        </div>
                    </section>
                    <section id="support">
                        <div className={styles.sectionHeader}>
                            <div>
                                <p className={styles.eyebrow}>Help desk</p>
                                <h2 className={styles.sectionTitle}>
                                    Need a hand?
                                </h2>
                            </div>
                        </div>
                        <div className={styles.ticketPanel}>
                            <h3>Create a support request</h3>
                            <form onSubmit={submitTicket}>
                                <label className={styles.field}>
                                    Subject
                                    <input
                                        value={ticket.subject}
                                        onChange={(event) =>
                                            setTicket({
                                                ...ticket,
                                                subject: event.target.value,
                                            })
                                        }
                                        required
                                        maxLength={160}
                                    />
                                </label>
                                <label className={styles.field}>
                                    Related project
                                    <select
                                        value={ticket.projectId}
                                        onChange={(event) =>
                                            setTicket({
                                                ...ticket,
                                                projectId: event.target.value,
                                            })
                                        }
                                    >
                                        <option value="">
                                            General question
                                        </option>
                                        {projects.map((project) => (
                                            <option
                                                value={project._id}
                                                key={project._id}
                                            >
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className={styles.field}>
                                    Priority
                                    <select
                                        value={ticket.priority}
                                        onChange={(event) =>
                                            setTicket({
                                                ...ticket,
                                                priority: event.target.value,
                                            })
                                        }
                                    >
                                        {[
                                            "Low",
                                            "Normal",
                                            "High",
                                            "Urgent",
                                        ].map((priority) => (
                                            <option key={priority}>
                                                {priority}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className={styles.field}>
                                    Description
                                    <textarea
                                        value={ticket.description}
                                        onChange={(event) =>
                                            setTicket({
                                                ...ticket,
                                                description: event.target.value,
                                            })
                                        }
                                        required
                                        maxLength={2000}
                                    />
                                </label>
                                <p
                                    className={styles.message}
                                    aria-live="polite"
                                >
                                    {ticketMessage}
                                </p>
                                <button
                                    className={styles.button}
                                    disabled={submitting}
                                >
                                    {submitting ? "Sending..." : "Send request"}
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
