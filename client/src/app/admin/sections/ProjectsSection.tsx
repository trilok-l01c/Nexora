"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminData } from "../AdminDataContext";
import {
    PROJECT_STATUSES,
    formatDate,
    relativeTime,
    type AdminProject,
    type ProjectTechnologyGroup,
} from "../adminTypes";
import {
    Alert,

    EmptyState,
    ProgressBar,
    ProjectStatusBadge,
} from "../components/primitives";
import { ArrowRightIcon, SearchIcon } from "../components/icons";
import styles from "../workspace.module.css";

export default function ProjectsSection() {
    const { projects, loadProjects, loading, errors } = useAdminData();
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (projects.length === 0) {
            void loadProjects().catch(() => undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        return projects.filter((project) => {
            if (statusFilter !== "all" && project.status !== statusFilter) {
                return false;
            }
            if (!term) return true;
            return [project.name, project.serviceType, project.description]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term));
        });
    }, [projects, query, statusFilter]);

    const selected = useMemo(
        () => projects.find((project) => project._id === selectedId) ?? null,
        [projects, selectedId],
    );

    const activeCount = projects.filter(
        (project) => project.status !== "Completed",
    ).length;

    return (
        <div className={styles.stack}>
            <header className={styles.pageHeader}>
                <div>
                    <p className={styles.pageKicker}>Delivery</p>
                    <h1 className={styles.pageTitle}>Projects</h1>
                    <p className={styles.pageSubtitle}>
                        Client work in flight. Update status and progress, assign
                        the team, and record the technologies in use so the
                        portal always shows the truth.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <span className={styles.badge}>
                        {activeCount} active
                    </span>
                    <span className={styles.badge}>{projects.length} total</span>
                </div>
            </header>

            {errors.projects ? <Alert tone="red">{errors.projects}</Alert> : null}

            <div className={styles.split}>
                <section className={styles.panel}>
                    <div className={styles.toolbar}>
                        <div className={styles.searchField}>
                            <span className={styles.searchIcon}>
                                <SearchIcon />
                            </span>
                            <input
                                className={styles.input}
                                type="search"
                                value={query}
                                placeholder="Search project or service…"
                                aria-label="Search projects"
                                onChange={(event) => setQuery(event.target.value)}
                            />
                        </div>
                        <select
                            className={`${styles.select} ${styles.toolbarEnd}`}
                            style={{ width: "auto" }}
                            value={statusFilter}
                            aria-label="Filter projects by status"
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                        >
                            <option value="all">All statuses</option>
                            {PROJECT_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loading.projects ? (
                        <div className={styles.empty}>
                            <p className={styles.emptyText}>Loading projects…</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <EmptyState
                            title={
                                projects.length === 0
                                    ? "No projects yet"
                                    : "No projects match these filters"
                            }
                            hint={
                                projects.length === 0
                                    ? "A project is created when a client submits a request from their portal."
                                    : "Try a different status or search term."
                            }
                        />
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Project</th>
                                        <th>Status</th>
                                        <th>Progress</th>
                                        <th>Team</th>
                                        <th>Updated</th>
                                        <th className={styles.cellActions}>
                                            Open
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((project) => (
                                        <tr
                                            key={project._id}
                                            className={
                                                project._id === selectedId
                                                    ? styles.tableRowActive
                                                    : ""
                                            }
                                        >
                                            <td>
                                                <div className={styles.cellStrong}>
                                                    {project.name}
                                                </div>
                                                <div className={styles.cellMuted}>
                                                    {project.serviceType}
                                                </div>
                                            </td>
                                            <td>
                                                <ProjectStatusBadge
                                                    status={project.status}
                                                />
                                            </td>
                                            <td>
                                                <ProgressBar
                                                    value={project.progress}
                                                />
                                            </td>
                                            <td className={styles.cellMuted}>
                                                {(project.teamMembers || []).length}{" "}
                                                member
                                                {(project.teamMembers || [])
                                                    .length === 1
                                                    ? ""
                                                    : "s"}
                                            </td>
                                            <td className={styles.cellMuted}>
                                                {relativeTime(project.updatedAt)}
                                            </td>
                                            <td className={styles.cellActions}>
                                                <button
                                                    type="button"
                                                    className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                                                    onClick={() =>
                                                        setSelectedId(project._id)
                                                    }
                                                >
                                                    Open
                                                    <ArrowRightIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className={styles.panelFooter}>
                        <span className={styles.spinnerText}>
                            Showing {filtered.length} of {projects.length}{" "}
                            projects
                        </span>
                    </div>
                </section>

                <aside className={styles.stackTight}>
                    {selected ? (
                        <ProjectDetail
                            key={selected._id}
                            project={selected}
                            onClose={() => setSelectedId(null)}
                        />
                    ) : (
                        <section className={styles.panel}>
                            <EmptyState
                                title="Select a project"
                                hint="Choose a project to manage its status, progress, team, and technologies."
                            />
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
}

function ProjectDetail({
    project,
    onClose,
}: {
    project: AdminProject;
    onClose: () => void;
}) {
    const { updateProject, team, loadTeam, loading, errors } = useAdminData();
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (team.length === 0) void loadTeam().catch(() => undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const assignedIds = useMemo(
        () =>
            new Set(
                (project.teamMembers || []).map((member) => member._id),
            ),
        [project.teamMembers],
    );

    async function patch(
        changes: Parameters<typeof updateProject>[1],
        confirmText: string,
    ) {
        setBusy(true);
        setMessage("");
        try {
            await updateProject(project._id, changes);
            setMessage(confirmText);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Could not update the project.",
            );
        } finally {
            setBusy(false);
        }
    }

    function setTeamMembers(ids: string[]) {
        void patch(
            { teamMembers: ids },
            "Project team updated.",
        );
    }

    return (
        <section className={styles.panel}>
            <div className={styles.panelHeader}>
                <div>
                    <p className={styles.pageKicker}>{project.serviceType}</p>
                    <h2 className={styles.panelTitle}>{project.name}</h2>
                    <p className={styles.panelHint}>
                        Requested {formatDate(project.createdAt)}
                    </p>
                </div>
                <button
                    type="button"
                    className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                    onClick={onClose}
                >
                    Close
                </button>
            </div>

            <div className={styles.panelBody}>
                <div className={styles.stackTight}>
                    {message ? (
                        <Alert tone="green">{message}</Alert>
                    ) : null}
                    {errors.projects ? (
                        <Alert tone="red">{errors.projects}</Alert>
                    ) : null}

                    <div className={styles.grid2}>
                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>Status</span>
                            <select
                                className={styles.select}
                                value={project.status}
                                disabled={busy}
                                onChange={(event) =>
                                    void patch(
                                        { status: event.target.value },
                                        "Project status updated.",
                                    )
                                }
                            >
                                {PROJECT_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>
                                Progress ({project.progress}%)
                            </span>
                            <input
                                className={styles.input}
                                type="number"
                                min="0"
                                max="100"
                                value={project.progress}
                                disabled={busy}
                                onChange={(event) =>
                                    void patch(
                                        { progress: Number(event.target.value) },
                                        "Project progress updated.",
                                    )
                                }
                            />
                        </label>
                    </div>

                    <ProgressBar value={project.progress} />

                    <div>
                        <p className={styles.fieldLabel}>Description</p>
                        <p className={styles.noticeItem}>
                            {project.description}
                        </p>
                    </div>

                    <div>
                        <p className={styles.fieldLabel}>Team members</p>
                        {(project.teamMembers || []).length > 0 ? (
                            <div className={styles.chipList}>
                                {(project.teamMembers || []).map((member) => (
                                    <span className={styles.chip} key={member._id}>
                                        {member.name || member.email}
                                        <button
                                            type="button"
                                            className={styles.chipRemove}
                                            disabled={busy}
                                            aria-label={`Remove ${member.name || member.email} from the team`}
                                            onClick={() =>
                                                setTeamMembers(
                                                    [...assignedIds].filter(
                                                        (id) =>
                                                            id !== member._id,
                                                    ),
                                                )
                                            }
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.panelHint}>
                                No team assigned yet.
                            </p>
                        )}
                        {team.length > 0 ? (
                            <div className={styles.chipList} style={{ marginTop: 10 }}>
                                {team
                                    .filter((member) => !assignedIds.has(member._id))
                                    .map((member) => (
                                        <button
                                            type="button"
                                            key={member._id}
                                            className={styles.filterChip}
                                            disabled={busy}
                                            onClick={() =>
                                                setTeamMembers([
                                                    ...assignedIds,
                                                    member._id,
                                                ])
                                            }
                                        >
                                            +{" "}
                                            {member.name || member.email}
                                        </button>
                                    ))}
                            </div>
                        ) : loading.team ? (
                            <p className={styles.fieldHint}>Loading team…</p>
                        ) : null}
                    </div>

                    <TechnologyEditor
                        project={project}
                        busy={busy}
                        onSave={(technologies) =>
                            patch(
                                { technologies },
                                "Technologies updated.",
                            )
                        }
                    />

                    {(project.milestones || []).length > 0 ? (
                        <div>
                            <p className={styles.fieldLabel}>Milestones</p>
                            <ul className={styles.timeline}>
                                {project.milestones.map((milestone) => (
                                    <li
                                        key={`${milestone.name}-${milestone.order}`}
                                        className={styles.timelineItem}
                                        data-type={
                                            milestone.status === "completed"
                                                ? "converted"
                                                : milestone.status === "current"
                                                  ? "status"
                                                  : "note"
                                        }
                                    >
                                        <p className={styles.timelineText}>
                                            {milestone.name}
                                        </p>
                                        <p className={styles.timelineTime}>
                                            {milestone.status}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    {(project.updates || []).length > 0 ? (
                        <div>
                            <p className={styles.fieldLabel}>Updates</p>
                            <ul className={styles.miniList}>
                                {project.updates.map((update) => (
                                    <li className={styles.miniItem} key={update._id}>
                                        <div className={styles.miniItemMain}>
                                            <p className={styles.miniItemTitle}>
                                                {update.title}
                                            </p>
                                            <p className={styles.miniItemMeta}>
                                                {update.category} ·{" "}
                                                {relativeTime(update.createdAt)}
                                                {update.author?.name
                                                    ? ` · ${update.author.name}`
                                                    : ""}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}

// Technologies are stored grouped by category, so the editor edits that shape
// directly and serialises it back exactly as the API expects.
function TechnologyEditor({
    project,
    busy,
    onSave,
}: {
    project: AdminProject;
    busy: boolean;
    onSave: (technologies: ProjectTechnologyGroup[]) => void;
}) {
    const serialised = serialiseTechnologies(project.technologies || []);
    // `key` on this component resets the draft whenever the saved technologies
    // change, so no state needs to be synced back in an effect.
    return (
        <TechnologyEditorForm
            key={serialised}
            serialised={serialised}
            busy={busy}
            onSave={onSave}
        />
    );
}

function TechnologyEditorForm({
    serialised,
    busy,
    onSave,
}: {
    serialised: string;
    busy: boolean;
    onSave: (technologies: ProjectTechnologyGroup[]) => void;
}) {
    const [text, setText] = useState(serialised);
    const [editing, setEditing] = useState(false);

    return (
        <div>
            <div
                className={styles.btnRow}
                style={{ justifyContent: "space-between" }}
            >
                <p className={styles.fieldLabel} style={{ marginBottom: 0 }}>
                    Technologies
                </p>
                {editing ? (
                    <div className={styles.btnRow}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                            disabled={busy}
                            onClick={() => {
                                setText(serialised);
                                setEditing(false);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                            disabled={busy}
                            onClick={() => {
                                onSave(parseTechnologies(text));
                                setEditing(false);
                            }}
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                        disabled={busy}
                        onClick={() => setEditing(true)}
                    >
                        Edit
                    </button>
                )}
            </div>

            {editing ? (
                <textarea
                    className={styles.textarea}
                    value={text}
                    rows={4}
                    placeholder={"Frontend: React, Next.js\nBackend: Node.js, MongoDB"}
                    style={{ marginTop: 10 }}
                    onChange={(event) => setText(event.target.value)}
                />
            ) : !serialised ? (
                <p className={styles.panelHint}>
                    No technologies recorded yet.
                </p>
            ) : (
                <div className={styles.chipList} style={{ marginTop: 8 }}>
                    {parseTechnologies(serialised).map((group) => (
                        <span
                            className={styles.chip}
                            key={group.category || "general"}
                        >
                            <strong>{group.category || "General"}</strong>
                            {group.items.join(", ")}
                        </span>
                    ))}
                </div>
            )}
            {editing ? (
                <p className={styles.fieldHint}>
                    One category per line, as{" "}
                    <code>Category: item, item</code>
                </p>
            ) : null}
        </div>
    );
}

function serialiseTechnologies(groups: ProjectTechnologyGroup[]) {
    return groups
        .map(
            (group) =>
                `${group.category || "General"}: ${(group.items || []).join(", ")}`,
        )
        .join("\n");
}

function parseTechnologies(text: string): ProjectTechnologyGroup[] {
    return text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [category, rest] = line.split(":");
            const items = (rest || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
            return {
                category: (category || "General").trim(),
                items,
            };
        })
        .filter((group) => group.items.length > 0);
}
