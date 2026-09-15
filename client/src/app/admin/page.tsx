"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { defaultHomeContent, type HomeContent } from "../homeContent";
import { useClientAuth } from "../client/ClientAuthContext";
import PortfolioManager from "./PortfolioManager";
import styles from "./page.module.css";

type Project = {
    _id: string;
    name: string;
    companyId: string;
    serviceType: string;
    description: string;
    status: string;
    progress: number;
    createdAt: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";

type ContentSection = "hero" | "solutions" | "industries" | "approach";

function Field({
    label,
    value,
    onChange,
    multiline = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    multiline?: boolean;
}) {
    return (
        <label className={styles.editorField}>
            <span>{label}</span>
            {multiline ? (
                <textarea
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    rows={3}
                />
            ) : (
                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            )}
        </label>
    );
}

export default function AdminPage() {
    const { refresh } = useClientAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [homeContent, setHomeContent] =
        useState<HomeContent>(defaultHomeContent);
    const [contentSection, setContentSection] =
        useState<ContentSection>("hero");

    async function loadProjects() {
        const response = await fetch(`${apiUrl}/api/admin/projects`, {
            credentials: "include",
        });
        const result = await response.json();
        if (!response.ok)
            throw new Error(result.message || "Could not load projects.");
        setProjects(result.data);
    }

    async function updateProject(
        id: string,
        changes: { status?: string; progress?: number },
    ) {
        const response = await fetch(`${apiUrl}/api/admin/projects/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(changes),
        });
        const result = await response.json();
        if (!response.ok) {
            setMessage(result.message || "Could not update project.");
            return;
        }
        await loadProjects();
    }

    async function loadHomeContent() {
        const response = await fetch(`${apiUrl}/api/admin/home`, {
            credentials: "include",
        });
        const result = await response.json();
        if (!response.ok)
            throw new Error(
                result.message || "Could not load homepage content.",
            );
        const content: HomeContent = {
            ...defaultHomeContent,
            ...result.data,
            hero: { ...defaultHomeContent.hero, ...result.data.hero },
            approach: {
                ...defaultHomeContent.approach,
                ...result.data.approach,
            },
            stats: result.data.stats || defaultHomeContent.stats,
            ticker: result.data.ticker || defaultHomeContent.ticker,
            solutions: result.data.solutions || defaultHomeContent.solutions,
            industries: result.data.industries || defaultHomeContent.industries,
        };
        setHomeContent(content);
    }

    async function saveHomeContent() {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/admin/home`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content: homeContent }),
            });
            const result = await response.json();
            if (!response.ok)
                throw new Error(
                    result.message || "Could not save homepage content.",
                );
            setHomeContent(result.data);
            setMessage("Homepage content saved.");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Could not save homepage content.",
            );
        } finally {
            setLoading(false);
        }
    }

    function updateHomeContent<K extends keyof HomeContent>(
        section: K,
        value: HomeContent[K],
    ) {
        setHomeContent((current) => ({ ...current, [section]: value }));
    }

    function updateListItem<
        K extends "ticker" | "solutions" | "industries" | "stats",
    >(section: K, index: number, value: HomeContent[K][number]) {
        const next = [...homeContent[section]];
        next[index] = value;
        updateHomeContent(section, next as HomeContent[K]);
    }

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${apiUrl}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.message || "Login failed.");
            await loadProjects();
            await loadHomeContent();
            setAuthenticated(true);
            // Re-read the shared session so the site navigation shows the
            // signed-in (admin) state instead of a stale "Sign In" button.
            await refresh().catch(() => undefined);
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Login failed.",
            );
        } finally {
            setLoading(false);
        }
    }

    function logout() {
        fetch(`${apiUrl}/api/admin/logout`, {
            method: "POST",
            credentials: "include",
        }).catch(() => undefined);
        setAuthenticated(false);
        setProjects([]);
        setPassword("");
        // Same server endpoint clears the admin cookie, so drop the client-side
        // session state as well and let the navigation re-render as signed out.
        void refresh();
    }

    if (!authenticated) {
        return (
            <main className={styles.page}>
                <section className={styles.loginPanel}>
                    <Link className={styles.brand} href="/">
                        <span className={styles.brandMark}>N</span>
                        Nexora
                    </Link>
                    <p className={styles.kicker}>Internal workspace</p>
                    <h1>
                        Welcome
                        <br />
                        <em>back.</em>
                    </h1>
                    <form onSubmit={handleLogin}>
                        <label>
                            Email
                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                                autoComplete="username"
                            />
                        </label>
                        <label>
                            Password
                            <input
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                required
                                autoComplete="current-password"
                            />
                        </label>
                        <p className={styles.message} aria-live="polite">
                            {message}
                        </p>
                        <button type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}{" "}
                            <span>↗</span>
                        </button>
                    </form>
                </section>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <section className={styles.dashboard}>
                <header className={styles.header}>
                    <Link className={styles.brand} href="/">
                        <span className={styles.brandMark}>N</span>
                        Nexora
                    </Link>
                    <button className={styles.logout} onClick={logout}>
                        Sign out
                    </button>
                </header>
                <p className={styles.kicker}>Project operations</p>
                <h1>
                    Work worth
                    <br />
                    <em>moving.</em>
                </h1>
                <section className={styles.contentEditor}>
                    <div className={styles.editorHeader}>
                        <div>
                            <p className={styles.editorKicker}>
                                Homepage content
                            </p>
                            <p className={styles.editorHint}>
                                Edit the homepage content document, then publish
                                it.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={saveHomeContent}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save homepage"}
                        </button>
                    </div>
                    <nav
                        className={styles.editorTabs}
                        aria-label="Homepage sections"
                    >
                        {(
                            [
                                ["hero", "Hero"],
                                ["solutions", "Solutions"],
                                ["industries", "Industries"],
                                ["approach", "Approach"],
                            ] as [ContentSection, string][]
                        ).map(([value, label]) => (
                            <button
                                className={
                                    contentSection === value
                                        ? styles.tabActive
                                        : styles.tab
                                }
                                key={value}
                                type="button"
                                onClick={() => setContentSection(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>
                    <div className={styles.editorBody}>
                        {contentSection === "hero" && (
                            <div className={styles.editorGrid}>
                                <Field
                                    label="Eyebrow"
                                    value={homeContent.hero.eyebrow}
                                    onChange={(value) =>
                                        updateHomeContent("hero", {
                                            ...homeContent.hero,
                                            eyebrow: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Title"
                                    value={homeContent.hero.title}
                                    onChange={(value) =>
                                        updateHomeContent("hero", {
                                            ...homeContent.hero,
                                            title: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Emphasis"
                                    value={homeContent.hero.titleEmphasis}
                                    onChange={(value) =>
                                        updateHomeContent("hero", {
                                            ...homeContent.hero,
                                            titleEmphasis: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Title ending"
                                    value={homeContent.hero.titleSuffix}
                                    onChange={(value) =>
                                        updateHomeContent("hero", {
                                            ...homeContent.hero,
                                            titleSuffix: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Description"
                                    multiline
                                    value={homeContent.hero.text}
                                    onChange={(value) =>
                                        updateHomeContent("hero", {
                                            ...homeContent.hero,
                                            text: value,
                                        })
                                    }
                                />
                            </div>
                        )}
                        {contentSection === "approach" && (
                            <div className={styles.editorGrid}>
                                <Field
                                    label="Meta line"
                                    value={homeContent.approach.meta}
                                    onChange={(value) =>
                                        updateHomeContent("approach", {
                                            ...homeContent.approach,
                                            meta: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Meta second line"
                                    value={homeContent.approach.metaSecondLine}
                                    onChange={(value) =>
                                        updateHomeContent("approach", {
                                            ...homeContent.approach,
                                            metaSecondLine: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Title"
                                    value={homeContent.approach.title}
                                    onChange={(value) =>
                                        updateHomeContent("approach", {
                                            ...homeContent.approach,
                                            title: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Title second line"
                                    value={homeContent.approach.titleSecondLine}
                                    onChange={(value) =>
                                        updateHomeContent("approach", {
                                            ...homeContent.approach,
                                            titleSecondLine: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Title emphasis"
                                    value={homeContent.approach.titleEmphasis}
                                    onChange={(value) =>
                                        updateHomeContent("approach", {
                                            ...homeContent.approach,
                                            titleEmphasis: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Link label"
                                    value={homeContent.approach.linkLabel}
                                    onChange={(value) =>
                                        updateHomeContent("approach", {
                                            ...homeContent.approach,
                                            linkLabel: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Description"
                                    multiline
                                    value={homeContent.approach.text}
                                    onChange={(value) =>
                                        updateHomeContent("approach", {
                                            ...homeContent.approach,
                                            text: value,
                                        })
                                    }
                                />
                            </div>
                        )}
                        {contentSection === "approach" && (
                            <div className={styles.statsEditor}>
                                <div className={styles.editorCardHeader}>
                                    <strong>Approach statistics</strong>
                                    <button
                                        type="button"
                                        className={styles.addButton}
                                        onClick={() =>
                                            updateHomeContent("stats", [
                                                ...homeContent.stats,
                                                {
                                                    value: "0",
                                                    label: "new",
                                                    detail: "stat",
                                                },
                                            ])
                                        }
                                    >
                                        Add stat
                                    </button>
                                </div>
                                <div className={styles.editorGrid}>
                                    {homeContent.stats.map((stat, index) => (
                                        <div
                                            className={styles.statEditor}
                                            key={`${stat.value}-${index}`}
                                        >
                                            <Field
                                                label="Value"
                                                value={stat.value}
                                                onChange={(value) =>
                                                    updateListItem(
                                                        "stats",
                                                        index,
                                                        {
                                                            ...stat,
                                                            value,
                                                        },
                                                    )
                                                }
                                            />
                                            <Field
                                                label="Label"
                                                value={stat.label}
                                                onChange={(value) =>
                                                    updateListItem(
                                                        "stats",
                                                        index,
                                                        {
                                                            ...stat,
                                                            label: value,
                                                        },
                                                    )
                                                }
                                            />
                                            <Field
                                                label="Detail"
                                                value={stat.detail}
                                                onChange={(value) =>
                                                    updateListItem(
                                                        "stats",
                                                        index,
                                                        {
                                                            ...stat,
                                                            detail: value,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {contentSection === "solutions" && (
                            <div className={styles.editorList}>
                                {homeContent.solutions.map(
                                    (solution, index) => (
                                        <div
                                            className={styles.editorCard}
                                            key={`${solution.number}-${index}`}
                                        >
                                            <div
                                                className={
                                                    styles.editorCardHeader
                                                }
                                            >
                                                <strong>
                                                    Solution {index + 1}
                                                </strong>
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.removeButton
                                                    }
                                                    onClick={() =>
                                                        updateHomeContent(
                                                            "solutions",
                                                            homeContent.solutions.filter(
                                                                (
                                                                    _,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex !==
                                                                    index,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className={styles.editorGrid}>
                                                <Field
                                                    label="Number"
                                                    value={solution.number}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                number: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Label"
                                                    value={solution.label}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                label: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Title"
                                                    value={solution.title}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                title: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Title second line"
                                                    value={
                                                        solution.titleSecondLine
                                                    }
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                titleSecondLine:
                                                                    value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Link label"
                                                    value={solution.link}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                link: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Link URL"
                                                    value={solution.href}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                href: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Description"
                                                    multiline
                                                    value={solution.text}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                text: value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ),
                                )}
                                <button
                                    type="button"
                                    className={styles.addButton}
                                    onClick={() =>
                                        updateHomeContent("solutions", [
                                            ...homeContent.solutions,
                                            {
                                                number: String(
                                                    homeContent.solutions
                                                        .length + 1,
                                                ).padStart(2, "0"),
                                                label: "New",
                                                title: "New solution",
                                                titleSecondLine:
                                                    "Add a description.",
                                                text: "Describe this solution.",
                                                href: "/services/software-development",
                                                link: "Learn more",
                                            },
                                        ])
                                    }
                                >
                                    Add solution
                                </button>
                            </div>
                        )}
                        {contentSection === "industries" && (
                            <div className={styles.editorList}>
                                {homeContent.industries.map(
                                    (industry, index) => (
                                        <div
                                            className={styles.editorCard}
                                            key={`${industry.number}-${index}`}
                                        >
                                            <div
                                                className={
                                                    styles.editorCardHeader
                                                }
                                            >
                                                <strong>
                                                    Industry {index + 1}
                                                </strong>
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.removeButton
                                                    }
                                                    onClick={() =>
                                                        updateHomeContent(
                                                            "industries",
                                                            homeContent.industries.filter(
                                                                (
                                                                    _,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex !==
                                                                    index,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className={styles.editorGrid}>
                                                <Field
                                                    label="Number"
                                                    value={industry.number}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "industries",
                                                            index,
                                                            {
                                                                ...industry,
                                                                number: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Name"
                                                    value={industry.name}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "industries",
                                                            index,
                                                            {
                                                                ...industry,
                                                                name: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Title"
                                                    value={industry.title}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "industries",
                                                            index,
                                                            {
                                                                ...industry,
                                                                title: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Outcomes"
                                                    value={industry.outcomes}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "industries",
                                                            index,
                                                            {
                                                                ...industry,
                                                                outcomes: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Description"
                                                    multiline
                                                    value={industry.text}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "industries",
                                                            index,
                                                            {
                                                                ...industry,
                                                                text: value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ),
                                )}
                                <button
                                    type="button"
                                    className={styles.addButton}
                                    onClick={() =>
                                        updateHomeContent("industries", [
                                            ...homeContent.industries,
                                            {
                                                number: String(
                                                    homeContent.industries
                                                        .length + 1,
                                                ).padStart(2, "0"),
                                                name: "New industry",
                                                title: "A clearer way forward.",
                                                text: "Describe how Nexora helps this industry.",
                                                outcomes:
                                                    "Key outcome · Key outcome",
                                            },
                                        ])
                                    }
                                >
                                    Add industry
                                </button>
                            </div>
                        )}
                        <div className={styles.tickerEditor}>
                            <div className={styles.editorCardHeader}>
                                <strong>Scrolling ticker</strong>
                                <button
                                    type="button"
                                    className={styles.addButton}
                                    onClick={() =>
                                        updateHomeContent("ticker", [
                                            ...homeContent.ticker,
                                            "New message",
                                        ])
                                    }
                                >
                                    Add item
                                </button>
                            </div>
                            {homeContent.ticker.map((item, index) => (
                                <div
                                    key={`ticker-${index}`}
                                    className={styles.tickerItem}
                                >
                                    <Field
                                        label={`Item ${index + 1}`}
                                        value={item}
                                        onChange={(value) =>
                                            updateListItem(
                                                "ticker",
                                                index,
                                                value,
                                            )
                                        }
                                    />
                                    <button
                                        type="button"
                                        className={styles.tickerRemove}
                                        onClick={() =>
                                            updateHomeContent(
                                                "ticker",
                                                homeContent.ticker.filter(
                                                    (_, i) => i !== index,
                                                ),
                                            )
                                        }
                                        aria-label={`Remove item ${index + 1}`}
                                    >
                                        −
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section className={styles.contentEditor}>
                    <div className={styles.editorHeader}>
                        <div>
                            <p className={styles.editorKicker}>Projects</p>
                            <p className={styles.editorHint}>
                                New requests appear here for review. Project
                                lifecycle fields remain staff-controlled.
                            </p>
                        </div>
                        <button type="button" onClick={loadProjects}>
                            Refresh projects
                        </button>
                    </div>
                    <div className={styles.projectList}>
                        {projects.length === 0 ? (
                            <p className={styles.empty}>
                                No projects have been requested yet.
                            </p>
                        ) : (
                            projects.map((project) => (
                                <article
                                    className={styles.projectCard}
                                    key={project._id}
                                >
                                    <div className={styles.projectCardTop}>
                                        <strong>{project.name}</strong>
                                        <span>{project.status}</span>
                                    </div>
                                    <p>
                                        {project.serviceType} ·{" "}
                                        {project.progress}% complete
                                    </p>
                                    <p>{project.description}</p>
                                    <small>
                                        Requested{" "}
                                        {new Date(
                                            project.createdAt,
                                        ).toLocaleString()}
                                    </small>
                                    <div className={styles.editorGrid}>
                                        <label className={styles.editorField}>
                                            <span>Status</span>
                                            <select
                                                value={project.status}
                                                onChange={(event) =>
                                                    updateProject(project._id, {
                                                        status: event.target
                                                            .value,
                                                    })
                                                }
                                            >
                                                {[
                                                    "Pending Review",
                                                    "Planning",
                                                    "Design",
                                                    "Development",
                                                    "Testing",
                                                    "Review",
                                                    "Deployment",
                                                    "Completed",
                                                    "On Hold",
                                                ].map((status) => (
                                                    <option key={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className={styles.editorField}>
                                            <span>Progress</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={project.progress}
                                                onChange={(event) =>
                                                    updateProject(project._id, {
                                                        progress: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </label>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>
                <PortfolioManager />
            </section>
        </main>
    );
}
