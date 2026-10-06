"use client";

import { useEffect, useState } from "react";
import { useAdminData } from "../AdminDataContext";
import type { HomeContent } from "../../homeContent";
import { Alert } from "../components/primitives";
import { PlusIcon, TrashIcon } from "../components/icons";
import styles from "../workspace.module.css";

type ContentSection = "hero" | "solutions" | "industries" | "ticker";

const TABS: [ContentSection, string][] = [
    ["hero", "Hero"],
    ["solutions", "Solutions"],
    ["industries", "Industries"],
    ["ticker", "Scrolling ticker"],
];

export default function SiteContentSection() {
    const {
        homeContent,
        setHomeContent,
        saveHomeContent,
        loadHomeContent,
        loading,
        errors,
    } = useAdminData();
    const [section, setSection] = useState<ContentSection>("hero");
    const [message, setMessage] = useState("");

    useEffect(() => {
        void loadHomeContent().catch(() => undefined);
    }, [loadHomeContent]);

    function update<K extends keyof HomeContent>(
        key: K,
        value: HomeContent[K],
    ) {
        setHomeContent((current) => ({ ...current, [key]: value }));
    }

    function updateListItem<K extends "ticker" | "solutions" | "industries">(
        key: K,
        index: number,
        value: HomeContent[K][number],
    ) {
        const next = [...homeContent[key]];
        next[index] = value;
        update(key, next as HomeContent[K]);
    }

    function removeItem<K extends "solutions" | "industries">(key: K, index: number) {
        update(
            key,
            homeContent[key].filter((_, itemIndex) => itemIndex !== index) as HomeContent[K],
        );
    }

    async function save() {
        setMessage("");
        try {
            await saveHomeContent();
            setMessage("Homepage content saved and published.");
        } catch {
            // The context records the failure; the banner below shows it.
        }
    }

    return (
        <div className={styles.stack}>
            <header className={styles.pageHeader}>
                <div>
                    <p className={styles.pageKicker}>Public website</p>
                    <h1 className={styles.pageTitle}>Site Content</h1>
                    <p className={styles.pageSubtitle}>
                        Edit the copy shown on the Nexora homepage. Changes go
                        live as soon as you save — the public site reads this
                        same content document.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={() => void loadHomeContent()}
                        disabled={loading.home}
                    >
                        {loading.home ? "Loading..." : "Reload"}
                    </button>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => void save()}
                        disabled={loading.home}
                    >
                        {loading.home ? "Saving..." : "Save & publish"}
                    </button>
                </div>
            </header>

            {errors.home ? <Alert tone="red">{errors.home}</Alert> : null}
            {message ? <Alert tone="green">{message}</Alert> : null}

            <nav className={styles.tabs} aria-label="Homepage sections">
                {TABS.map(([value, label]) => (
                    <button
                        key={value}
                        type="button"
                        className={`${styles.tab} ${
                            section === value ? styles.tabActive : ""
                        }`}
                        aria-pressed={section === value}
                        onClick={() => setSection(value)}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div>
                        <h2 className={styles.panelTitle}>
                            {TABS.find(([value]) => value === section)?.[1]}
                        </h2>
                        <p className={styles.panelHint}>
                            {SECTION_HINTS[section]}
                        </p>
                    </div>
                </div>
                <div className={styles.panelBody}>
                    <div className={styles.stack}>
                        {section === "hero" ? (
                            <div className={styles.grid2}>
                                <Field
                                    label="Eyebrow"
                                    value={homeContent.hero.eyebrow}
                                    onChange={(value) =>
                                        update("hero", {
                                            ...homeContent.hero,
                                            eyebrow: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Title"
                                    value={homeContent.hero.title}
                                    onChange={(value) =>
                                        update("hero", {
                                            ...homeContent.hero,
                                            title: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Emphasis"
                                    hint="Rendered in the accent green."
                                    value={homeContent.hero.titleEmphasis}
                                    onChange={(value) =>
                                        update("hero", {
                                            ...homeContent.hero,
                                            titleEmphasis: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Title ending"
                                    value={homeContent.hero.titleSuffix}
                                    onChange={(value) =>
                                        update("hero", {
                                            ...homeContent.hero,
                                            titleSuffix: value,
                                        })
                                    }
                                />
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <Field
                                        label="Description"
                                        multiline
                                        value={homeContent.hero.text}
                                        onChange={(value) =>
                                            update("hero", {
                                                ...homeContent.hero,
                                                text: value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        ) : null}

                        {section === "solutions" ? (
                            <div className={styles.stackTight}>
                                {homeContent.solutions.map((solution, index) => (
                                    <div className={styles.panel} key={`${solution.number}-${index}`}>
                                        <div className={styles.panelHeader}>
                                            <h3 className={styles.panelTitle}>
                                                Solution {index + 1}
                                            </h3>
                                            <button
                                                type="button"
                                                className={`${styles.btn} ${styles.btnDangerGhost} ${styles.btnSmall}`}
                                                onClick={() =>
                                                    removeItem("solutions", index)
                                                }
                                            >
                                                <TrashIcon />
                                                Remove
                                            </button>
                                        </div>
                                        <div className={styles.panelBody}>
                                            <div className={styles.grid2}>
                                                <Field
                                                    label="Number"
                                                    value={solution.number}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            { ...solution, number: value },
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
                                                            { ...solution, label: value },
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
                                                            { ...solution, title: value },
                                                        )
                                                    }
                                                />
                                                <Field
                                                    label="Title second line"
                                                    value={solution.titleSecondLine}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                titleSecondLine: value,
                                                            },
                                                        )
                                                    }
                                                />
                                                <div style={{ gridColumn: "1 / -1" }}>
                                                    <Field
                                                        label="Description"
                                                        multiline
                                                        value={solution.text}
                                                        onChange={(value) =>
                                                            updateListItem(
                                                                "solutions",
                                                                index,
                                                                { ...solution, text: value },
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <Field
                                                    label="Link"
                                                    value={solution.href}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            { ...solution, href: value },
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
                                                            { ...solution, link: value },
                                                        )
                                                    }
                                                />
                                            </div>
                                            <label
                                                className={styles.checkboxField}
                                                style={{ marginTop: 12 }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(solution.featured)}
                                                    onChange={(event) =>
                                                        updateListItem(
                                                            "solutions",
                                                            index,
                                                            {
                                                                ...solution,
                                                                featured: event.target
                                                                    .checked,
                                                            },
                                                        )
                                                    }
                                                />
                                                Featured solution
                                            </label>
                                        </div>
                                    </div>
                                ))}
                                <AddButton
                                    label="Add solution"
                                    onClick={() =>
                                        update("solutions", [
                                            ...homeContent.solutions,
                                            {
                                                number: String(
                                                    homeContent.solutions.length + 1,
                                                ).padStart(2, "0"),
                                                label: "New",
                                                title: "New solution",
                                                titleSecondLine: "Add a description.",
                                                text: "Describe this solution.",
                                                href: "/services/software-development",
                                                link: "Learn more",
                                            },
                                        ])
                                    }
                                />
                            </div>
                        ) : null}

                        {section === "industries" ? (
                            <div className={styles.stackTight}>
                                {homeContent.industries.map((industry, index) => (
                                    <div className={styles.panel} key={`${industry.number}-${index}`}>
                                        <div className={styles.panelHeader}>
                                            <h3 className={styles.panelTitle}>
                                                Industry {index + 1}
                                            </h3>
                                            <button
                                                type="button"
                                                className={`${styles.btn} ${styles.btnDangerGhost} ${styles.btnSmall}`}
                                                onClick={() =>
                                                    removeItem("industries", index)
                                                }
                                            >
                                                <TrashIcon />
                                                Remove
                                            </button>
                                        </div>
                                        <div className={styles.panelBody}>
                                            <div className={styles.grid2}>
                                                <Field
                                                    label="Number"
                                                    value={industry.number}
                                                    onChange={(value) =>
                                                        updateListItem(
                                                            "industries",
                                                            index,
                                                            { ...industry, number: value },
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
                                                            { ...industry, name: value },
                                                        )
                                                    }
                                                />
                                                <div style={{ gridColumn: "1 / -1" }}>
                                                    <Field
                                                        label="Title"
                                                        value={industry.title}
                                                        onChange={(value) =>
                                                            updateListItem(
                                                                "industries",
                                                                index,
                                                                { ...industry, title: value },
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div style={{ gridColumn: "1 / -1" }}>
                                                    <Field
                                                        label="Description"
                                                        multiline
                                                        value={industry.text}
                                                        onChange={(value) =>
                                                            updateListItem(
                                                                "industries",
                                                                index,
                                                                { ...industry, text: value },
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div style={{ gridColumn: "1 / -1" }}>
                                                    <Field
                                                        label="Outcomes"
                                                        hint="Separate items with ·"
                                                        value={industry.outcomes}
                                                        onChange={(value) =>
                                                            updateListItem(
                                                                "industries",
                                                                index,
                                                                { ...industry, outcomes: value },
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <AddButton
                                    label="Add industry"
                                    onClick={() =>
                                        update("industries", [
                                            ...homeContent.industries,
                                            {
                                                number: String(
                                                    homeContent.industries.length + 1,
                                                ).padStart(2, "0"),
                                                name: "New industry",
                                                title: "A clearer way forward.",
                                                text: "Describe how Nexora helps this industry.",
                                                outcomes: "Key outcome · Key outcome",
                                            },
                                        ])
                                    }
                                />
                            </div>
                        ) : null}

                        {section === "ticker" ? (
                            <div className={styles.stackTight}>
                                {homeContent.ticker.map((item, index) => (
                                    <div
                                        className={styles.miniItem}
                                        key={`ticker-${index}`}
                                    >
                                        <input
                                            className={styles.input}
                                            value={item}
                                            aria-label={`Ticker item ${index + 1}`}
                                            onChange={(event) =>
                                                updateListItem(
                                                    "ticker",
                                                    index,
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            className={`${styles.btn} ${styles.btnDangerGhost} ${styles.btnSmall}`}
                                            onClick={() =>
                                                update(
                                                    "ticker",
                                                    homeContent.ticker.filter(
                                                        (_, itemIndex) =>
                                                            itemIndex !== index,
                                                    ),
                                                )
                                            }
                                        >
                                            <TrashIcon />
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <AddButton
                                    label="Add item"
                                    onClick={() =>
                                        update("ticker", [
                                            ...homeContent.ticker,
                                            "New message",
                                        ])
                                    }
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>
        </div>
    );
}

const SECTION_HINTS: Record<ContentSection, string> = {
    hero: "The first thing visitors read on the homepage.",
    solutions: "The service cards that sit under the hero.",
    industries: "Who Nexora works with, shown on the homepage.",
    ticker: "Short phrases that scroll across the homepage banner.",
};

function Field({
    label,
    hint,
    value,
    onChange,
    multiline = false,
}: {
    label: string;
    hint?: string;
    value: string;
    onChange: (value: string) => void;
    multiline?: boolean;
}) {
    return (
        <label className={styles.field}>
            <span className={styles.fieldLabel}>{label}</span>
            {multiline ? (
                <textarea
                    className={styles.textarea}
                    value={value}
                    rows={3}
                    onChange={(event) => onChange(event.target.value)}
                />
            ) : (
                <input
                    className={styles.input}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            )}
            {hint ? <span className={styles.fieldHint}>{hint}</span> : null}
        </label>
    );
}

function AddButton({
    label,
    onClick,
}: {
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onClick}
        >
            <PlusIcon />
            {label}
        </button>
    );
}
