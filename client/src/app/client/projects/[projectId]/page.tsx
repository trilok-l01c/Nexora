"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../../portal.module.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";
type Member = {
    _id: string;
    name?: string;
    professionalTitle?: string;
    professionalBio?: string;
    avatarUrl?: string;
};
type Project = {
    name: string;
    description: string;
    requirements?: string;
    serviceType: string;
    status: string;
    progress: number;
    startDate?: string;
    expectedEndDate?: string;
    updatedAt: string;
    teamMembers: Member[];
    technologies: { category: string; items: string[] }[];
    milestones: { name: string; status: string }[];
    updates: {
        _id: string;
        title: string;
        description: string;
        category: string;
        createdAt: string;
        author?: Member;
    }[];
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

export default function ProjectDetails() {
    const params = useParams<{ projectId: string }>();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [error, setError] = useState("");
    useEffect(() => {
        fetch(`${apiUrl}/api/client/projects/${params.projectId}`, {
            credentials: "include",
        })
            .then(async (response) => {
                const result = await response.json();
                if (response.status === 401 || response.status === 403) {
                    router.replace("/client/login");
                    return null;
                }
                if (!response.ok)
                    throw new Error("This project is not available.");
                return result.data as Project;
            })
            .then((result) => result && setProject(result))
            .catch(() =>
                setError(
                    "This project could not be found or is not available to your account.",
                ),
            );
    }, [params.projectId, router]);
    if (!project && !error)
        return (
            <main className={styles.portal}>
                <div className={styles.main}>
                    <p className={styles.eyebrow}>Project</p>
                    <h1 className={styles.title}>Loading project...</h1>
                </div>
            </main>
        );
    if (error)
        return (
            <main className={styles.portal}>
                <div className={styles.main}>
                    <p className={`${styles.message} ${styles.error}`}>
                        {error}
                    </p>
                    <Link className={styles.back} href="/client/dashboard">
                        ← Back to dashboard
                    </Link>
                </div>
            </main>
        );
    return (
        <main className={styles.portal}>
            <div className={styles.shell}>
                <aside className={styles.sidebar}>
                    <Link className={styles.brand} href="/client/dashboard">
                        <span className={styles.brandMark}>N</span> Nexora
                    </Link>
                    <nav className={styles.nav}>
                        <Link href="/client/dashboard">Dashboard</Link>
                        <Link className={styles.active} href="#overview">
                            Project overview
                        </Link>
                        <Link href="#updates">Updates</Link>
                        <Link href="#team">Project team</Link>
                        <Link href="#technology">Technology</Link>
                    </nav>
                </aside>
                <div className={styles.main}>
                    <Link className={styles.back} href="/client/dashboard">
                        ← Back to dashboard
                    </Link>
                    <header className={styles.detailHeader} id="overview">
                        <div>
                            <span className={styles.badge}>
                                {project?.status}
                            </span>
                            <h1>{project?.name}</h1>
                            <p className={styles.subtle}>
                                {project?.serviceType}
                            </p>
                        </div>
                        <div className={styles.detailProgress}>
                            <span className={styles.label}>
                                Project progress
                            </span>
                            <strong>{project?.progress}%</strong>
                            <div className={styles.progressTrack}>
                                <div
                                    className={styles.progressBar}
                                    style={{
                                        width: `${project?.progress || 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </header>
                    <div className={styles.detailGrid}>
                        <div>
                            <section className={styles.detailSection}>
                                <h2>Project overview</h2>
                                <p className={styles.subtle}>
                                    {project?.description}
                                </p>
                                {project?.status === "Pending Review" && (
                                    <p className={styles.requestNotice}>
                                        Your project request has been submitted.
                                        The Nexora team will review the
                                        requirements and update the project
                                        status.
                                    </p>
                                )}
                                <div className={styles.projectFacts}>
                                    <div>
                                        <span className={styles.label}>
                                            Started
                                        </span>
                                        <span className={styles.factValue}>
                                            {date(project?.startDate)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className={styles.label}>
                                            Expected completion
                                        </span>
                                        <span className={styles.factValue}>
                                            {date(project?.expectedEndDate)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className={styles.label}>
                                            Last updated
                                        </span>
                                        <span className={styles.factValue}>
                                            {date(project?.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                            </section>
                            <section className={styles.detailSection}>
                                <h2>Project timeline</h2>
                                {project?.milestones?.length ? (
                                    <div className={styles.timeline}>
                                        {project.milestones.map(
                                            (milestone, index) => (
                                                <div
                                                    className={styles.milestone}
                                                    data-status={
                                                        milestone.status
                                                    }
                                                    key={`${milestone.name}-${index}`}
                                                >
                                                    <span
                                                        className={
                                                            styles.milestoneDot
                                                        }
                                                    >
                                                        {milestone.status ===
                                                        "completed"
                                                            ? "✓"
                                                            : milestone.status ===
                                                                "current"
                                                              ? "●"
                                                              : ""}
                                                    </span>
                                                    <strong>
                                                        {milestone.name}
                                                    </strong>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className={styles.empty}>
                                        The project timeline will appear here
                                        once milestones are scheduled.
                                    </p>
                                )}
                            </section>
                            <section
                                className={styles.detailSection}
                                id="updates"
                            >
                                <h2>Project updates</h2>
                                {project?.updates?.length ? (
                                    [...project.updates]
                                        .sort(
                                            (a, b) =>
                                                +new Date(b.createdAt) -
                                                +new Date(a.createdAt),
                                        )
                                        .map((update) => (
                                            <article
                                                className={styles.update}
                                                key={update._id}
                                            >
                                                <div
                                                    className={
                                                        styles.updateMeta
                                                    }
                                                >
                                                    <span>
                                                        {date(update.createdAt)}{" "}
                                                        · {update.category}
                                                    </span>
                                                    <span>
                                                        Updated by{" "}
                                                        {update.author?.name ||
                                                            "Nexora team"}
                                                    </span>
                                                </div>
                                                <h3>{update.title}</h3>
                                                <p className={styles.subtle}>
                                                    {update.description}
                                                </p>
                                            </article>
                                        ))
                                ) : (
                                    <p className={styles.empty}>
                                        No project updates have been posted yet.
                                    </p>
                                )}
                            </section>
                        </div>
                        <aside>
                            <section className={styles.detailSection} id="team">
                                <h2>Project team</h2>
                                {project?.teamMembers?.length ? (
                                    <div className={styles.teamGrid}>
                                        {project.teamMembers.map((member) => (
                                            <article
                                                className={styles.member}
                                                key={member._id}
                                            >
                                                <div className={styles.avatar}>
                                                    {(member.name || "N").slice(
                                                        0,
                                                        1,
                                                    )}
                                                </div>
                                                <div>
                                                    <h3>
                                                        {member.name ||
                                                            "Nexora team member"}
                                                    </h3>
                                                    <p>
                                                        <strong>
                                                            {member.professionalTitle ||
                                                                "Project team"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        {member.professionalBio ||
                                                            "Working with the Nexora team on this project."}
                                                    </p>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={styles.empty}>
                                        No team members have been assigned yet.
                                    </p>
                                )}
                            </section>
                            <section
                                className={styles.detailSection}
                                id="technology"
                            >
                                <h2>Technology stack</h2>
                                {project?.technologies?.length ? (
                                    project.technologies.map((group) => (
                                        <div
                                            className={styles.stackGroup}
                                            key={group.category}
                                        >
                                            <strong>{group.category}</strong>
                                            <div>
                                                {group.items.map((item) => (
                                                    <span
                                                        className={
                                                            styles.techBadge
                                                        }
                                                        key={item}
                                                    >
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.empty}>
                                        The technology stack will be listed here
                                        as the project takes shape.
                                    </p>
                                )}
                            </section>
                        </aside>
                    </div>
                </div>
            </div>
        </main>
    );
}
