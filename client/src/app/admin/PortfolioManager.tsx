"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import {
    PORTFOLIO_CATEGORIES,
    PORTFOLIO_STATUSES,
    formatPortfolioDate,
    type PortfolioProjectStatus,
    type PortfolioProjectWithStats,
    type PortfolioUpdate,
} from "../portfolioTypes";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";

type ProjectFormState = {
    title: string;
    shortDescription: string;
    description: string;
    category: string;
    status: PortfolioProjectStatus;
    featured: boolean;
    coverImage: string;
    images: string;
    technologies: string;
    services: string;
    projectUrl: string;
    completionDate: string;
};

type UpdateFormState = {
    title: string;
    description: string;
    date: string;
    images: string;
    technologies: string;
    link: string;
};

type ProjectFormTarget = {
    mode: "create" | "edit";
    id?: string;
};

type UpdateFormTarget = {
    mode: "create" | "edit";
    projectId: string;
    id?: string;
};

const emptyProjectForm: ProjectFormState = {
    title: "",
    shortDescription: "",
    description: "",
    category: "Web Development",
    status: "Draft",
    featured: false,
    coverImage: "",
    images: "",
    technologies: "",
    services: "",
    projectUrl: "",
    completionDate: "",
};

const emptyUpdateForm: UpdateFormState = {
    title: "",
    description: "",
    date: "",
    images: "",
    technologies: "",
    link: "",
};

async function apiRequest(path: string, options: RequestInit = {}) {
    const response = await fetch(`${apiUrl}${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.message || "Request failed. Try again.");
    }
    return result;
}

function splitList(text: string) {
    return text
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function toDateInputValue(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function projectToForm(
    project: PortfolioProjectWithStats,
): ProjectFormState {
    return {
        title: project.title,
        shortDescription: project.shortDescription,
        description: project.description || "",
        category: project.category,
        status: project.status,
        featured: Boolean(project.featured),
        coverImage: project.coverImage || "",
        images: (project.images || []).join("\n"),
        technologies: (project.technologies || []).join(", "),
        services: (project.services || []).join(", "),
        projectUrl: project.projectUrl || "",
        completionDate: toDateInputValue(project.completionDate),
    };
}

function updateToForm(update: PortfolioUpdate): UpdateFormState {
    return {
        title: update.title,
        description: update.description,
        date: toDateInputValue(update.date),
        images: (update.images || []).join("\n"),
        technologies: (update.technologies || []).join(", "),
        link: update.link || "",
    };
}

function buildProjectPayload(form: ProjectFormState) {
    return {
        title: form.title,
        shortDescription: form.shortDescription,
        description: form.description,
        category: form.category,
        status: form.status,
        featured: form.featured,
        coverImage: form.coverImage,
        projectUrl: form.projectUrl,
        completionDate: form.completionDate || undefined,
        technologies: splitList(form.technologies),
        services: splitList(form.services),
        images: splitList(form.images),
    };
}

function buildUpdatePayload(form: UpdateFormState) {
    return {
        title: form.title,
        description: form.description,
        date: form.date || undefined,
        technologies: splitList(form.technologies),
        images: splitList(form.images),
        link: form.link,
    };
}

export default function PortfolioManager() {
    const [projects, setProjects] = useState<PortfolioProjectWithStats[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [projectForm, setProjectForm] =
        useState<ProjectFormTarget | null>(null);
    const [projectValues, setProjectValues] =
        useState<ProjectFormState>(emptyProjectForm);
    const [openUpdatesFor, setOpenUpdatesFor] = useState<string | null>(null);
    const [updates, setUpdates] = useState<PortfolioUpdate[]>([]);
    const [updateForm, setUpdateForm] = useState<UpdateFormTarget | null>(
        null,
    );
    const [updateValues, setUpdateValues] =
        useState<UpdateFormState>(emptyUpdateForm);

    const loadProjects = useCallback(async () => {
        try {
            const result = await apiRequest("/api/admin/portfolio");
            setProjects(result.data);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Could not load portfolio projects.",
            );
        }
    }, []);

    async function refreshProjects() {
        setLoading(true);
        await loadProjects();
        setLoading(false);
    }

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const result = await apiRequest("/api/admin/portfolio");
                if (!cancelled) {
                    setProjects(result.data);
                }
            } catch (error) {
                if (!cancelled) {
                    setMessage(
                        error instanceof Error
                            ? error.message
                            : "Could not load portfolio projects.",
                    );
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    function setProjectField<K extends keyof ProjectFormState>(
        field: K,
        value: ProjectFormState[K],
    ) {
        setProjectValues((current) => ({ ...current, [field]: value }));
    }

    function setUpdateField<K extends keyof UpdateFormState>(
        field: K,
        value: UpdateFormState[K],
    ) {
        setUpdateValues((current) => ({ ...current, [field]: value }));
    }

    function startCreateProject() {
        setProjectValues(emptyProjectForm);
        setProjectForm({ mode: "create" });
        setMessage("");
    }

    function startEditProject(project: PortfolioProjectWithStats) {
        setProjectValues(projectToForm(project));
        setProjectForm({ mode: "edit", id: project._id });
        setMessage("");
    }

    function closeProjectForm() {
        setProjectForm(null);
        setProjectValues(emptyProjectForm);
    }

    async function saveProject(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!projectForm) return;
        setLoading(true);
        setMessage("");
        try {
            if (projectForm.mode === "create") {
                await apiRequest("/api/admin/portfolio", {
                    method: "POST",
                    body: JSON.stringify(buildProjectPayload(projectValues)),
                });
                setMessage("Portfolio project created.");
            } else {
                await apiRequest(`/api/admin/portfolio/${projectForm.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(buildProjectPayload(projectValues)),
                });
                setMessage("Portfolio project saved.");
            }
            closeProjectForm();
            await loadProjects();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Could not save the portfolio project.",
            );
        } finally {
            setLoading(false);
        }
    }

    async function deleteProject(project: PortfolioProjectWithStats) {
        if (
            !window.confirm(
                `Delete "${project.title}" from the portfolio? Its updates will also be removed.`,
            )
        ) {
            return;
        }
        setLoading(true);
        setMessage("");
        try {
            await apiRequest(`/api/admin/portfolio/${project._id}`, {
                method: "DELETE",
            });
            setMessage("Portfolio project deleted.");
            if (openUpdatesFor === project._id) closeUpdatesPanel();
            await loadProjects();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Could not delete the portfolio project.",
            );
        } finally {
            setLoading(false);
        }
    }

    function closeUpdatesPanel() {
        setOpenUpdatesFor(null);
        setUpdates([]);
        setUpdateForm(null);
        setUpdateValues(emptyUpdateForm);
    }

    async function toggleUpdatesPanel(projectId: string) {
        if (openUpdatesFor === projectId) {
            closeUpdatesPanel();
            return;
        }
        setLoading(true);
        setMessage("");
        try {
            const result = await apiRequest(
                `/api/admin/portfolio/${projectId}/updates`,
            );
            setUpdates(result.data);
            setOpenUpdatesFor(projectId);
            setUpdateForm(null);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Could not load project updates.",
            );
        } finally {
            setLoading(false);
        }
    }

    function startCreateUpdate() {
        if (!openUpdatesFor) return;
        setUpdateValues({
            ...emptyUpdateForm,
            date: toDateInputValue(new Date().toISOString()),
        });
        setUpdateForm({ mode: "create", projectId: openUpdatesFor });
    }

    function startEditUpdate(update: PortfolioUpdate) {
        setUpdateValues(updateToForm(update));
        setUpdateForm({
            mode: "edit",
            projectId: update.portfolioProjectId,
            id: update._id,
        });
    }

    async function saveUpdate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!updateForm) return;
        setLoading(true);
        setMessage("");
        try {
            if (updateForm.mode === "create") {
                await apiRequest(
                    `/api/admin/portfolio/${updateForm.projectId}/updates`,
                    {
                        method: "POST",
                        body: JSON.stringify(buildUpdatePayload(updateValues)),
                    },
                );
                setMessage("Project update added.");
            } else {
                await apiRequest(
                    `/api/admin/portfolio/${updateForm.projectId}/updates/${updateForm.id}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(buildUpdatePayload(updateValues)),
                    },
                );
                setMessage("Project update saved.");
            }
            const refreshed = await apiRequest(
                `/api/admin/portfolio/${updateForm.projectId}/updates`,
            );
            setUpdates(refreshed.data);
            setUpdateForm(null);
            setUpdateValues(emptyUpdateForm);
            await loadProjects();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Could not save the project update.",
            );
        } finally {
            setLoading(false);
        }
    }

    async function deleteUpdate(update: PortfolioUpdate) {
        if (!window.confirm(`Delete the update "${update.title}"?`)) {
            return;
        }
        setLoading(true);
        setMessage("");
        try {
            await apiRequest(
                `/api/admin/portfolio/${update.portfolioProjectId}/updates/${update._id}`,
                { method: "DELETE" },
            );
            setMessage("Portfolio update deleted.");
            const refreshed = await apiRequest(
                `/api/admin/portfolio/${update.portfolioProjectId}/updates`,
            );
            setUpdates(refreshed.data);
            await loadProjects();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Could not delete the update.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className={styles.contentEditor}>
            <div className={styles.editorHeader}>
                <div>
                    <p className={styles.editorKicker}>Portfolio</p>
                    <p className={styles.editorHint}>
                        Public showcase projects. Published projects appear on
                        /portfolio; drafts stay private. Client projects are
                        never added here automatically.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        type="button"
                        onClick={refreshProjects}
                        disabled={loading}
                    >
                        {loading ? "Working..." : "Refresh"}
                    </button>
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={startCreateProject}
                    >
                        Add project
                    </button>
                </div>
            </div>
            {message ? (
                <p className={styles.message} aria-live="polite">
                    {message}
                </p>
            ) : null}
            {projectForm ? (
                <form className={styles.portfolioForm} onSubmit={saveProject}>
                    <div className={styles.editorCardHeader}>
                        <strong>
                            {projectForm.mode === "create"
                                ? "New portfolio project"
                                : "Edit portfolio project"}
                        </strong>
                        <button
                            type="button"
                            className={styles.removeButton}
                            onClick={closeProjectForm}
                        >
                            Cancel
                        </button>
                    </div>
                    <div className={styles.editorGrid}>
                        <label className={styles.editorField}>
                            <span>Title</span>
                            <input
                                value={projectValues.title}
                                onChange={(event) =>
                                    setProjectField(
                                        "title",
                                        event.target.value,
                                    )
                                }
                                required
                                maxLength={160}
                            />
                        </label>
                        <label className={styles.editorField}>
                            <span>Short description</span>
                            <input
                                value={projectValues.shortDescription}
                                onChange={(event) =>
                                    setProjectField(
                                        "shortDescription",
                                        event.target.value,
                                    )
                                }
                                required
                                maxLength={300}
                            />
                        </label>
                    </div>
                    <label className={styles.editorField}>
                        <span>Detailed description (optional)</span>
                        <textarea
                            rows={4}
                            value={projectValues.description}
                            onChange={(event) =>
                                setProjectField(
                                    "description",
                                    event.target.value,
                                )
                            }
                        />
                    </label>
                    <div className={styles.editorGrid}>
                        <label className={styles.editorField}>
                            <span>Category</span>
                            <select
                                value={projectValues.category}
                                onChange={(event) =>
                                    setProjectField(
                                        "category",
                                        event.target.value,
                                    )
                                }
                            >
                                {PORTFOLIO_CATEGORIES.map((category) => (
                                    <option key={category}>{category}</option>
                                ))}
                            </select>
                        </label>
                        <label className={styles.editorField}>
                            <span>Status</span>
                            <select
                                value={projectValues.status}
                                onChange={(event) =>
                                    setProjectField(
                                        "status",
                                        event.target
                                            .value as PortfolioProjectStatus,
                                    )
                                }
                            >
                                {PORTFOLIO_STATUSES.map((status) => (
                                    <option key={status}>{status}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className={styles.editorGrid}>
                        <label className={styles.editorField}>
                            <span>Project URL (optional)</span>
                            <input
                                type="url"
                                value={projectValues.projectUrl}
                                onChange={(event) =>
                                    setProjectField(
                                        "projectUrl",
                                        event.target.value,
                                    )
                                }
                                placeholder="https://"
                            />
                        </label>
                        <label className={styles.editorField}>
                            <span>Completion date (optional)</span>
                            <input
                                type="date"
                                value={projectValues.completionDate}
                                onChange={(event) =>
                                    setProjectField(
                                        "completionDate",
                                        event.target.value,
                                    )
                                }
                            />
                        </label>
                    </div>
                    <div className={styles.editorGrid}>
                        <label className={styles.editorField}>
                            <span>Services (comma separated)</span>
                            <input
                                value={projectValues.services}
                                onChange={(event) =>
                                    setProjectField(
                                        "services",
                                        event.target.value,
                                    )
                                }
                                placeholder="Product strategy, UX design"
                            />
                        </label>
                        <label className={styles.editorField}>
                            <span>Technologies (comma separated)</span>
                            <input
                                value={projectValues.technologies}
                                onChange={(event) =>
                                    setProjectField(
                                        "technologies",
                                        event.target.value,
                                    )
                                }
                                placeholder="Next.js, MongoDB"
                            />
                        </label>
                    </div>
                    <div className={styles.editorGrid}>
                        <label className={styles.editorField}>
                            <span>Cover image URL (optional)</span>
                            <input
                                type="url"
                                value={projectValues.coverImage}
                                onChange={(event) =>
                                    setProjectField(
                                        "coverImage",
                                        event.target.value,
                                    )
                                }
                                placeholder="https://"
                            />
                        </label>
                        <label className={styles.editorField}>
                            <span>Additional images (one URL per line)</span>
                            <textarea
                                rows={3}
                                value={projectValues.images}
                                onChange={(event) =>
                                    setProjectField(
                                        "images",
                                        event.target.value,
                                    )
                                }
                                placeholder={"https://...\nhttps://..."}
                            />
                        </label>
                    </div>
                    <label className={styles.checkboxField}>
                        <input
                            type="checkbox"
                            checked={projectValues.featured}
                            onChange={(event) =>
                                setProjectField(
                                    "featured",
                                    event.target.checked,
                                )
                            }
                        />
                        <span>
                            Featured project (shown first on the public
                            portfolio)
                        </span>
                    </label>
                    <div className={styles.cardActions}>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {projectForm.mode === "create"
                                ? "Create project"
                                : "Save changes"}
                        </button>
                        <button type="button" onClick={closeProjectForm}>
                            Cancel
                        </button>
                    </div>
                </form>
            ) : null}
            <div className={styles.projectList}>
                {projects.length === 0 ? (
                    <p className={styles.empty}>
                        No portfolio projects yet. Add the first public
                        project.
                    </p>
                ) : (
                    projects.map((project) => (
                        <article
                            className={styles.projectCard}
                            key={project._id}
                        >
                            <div className={styles.projectCardTop}>
                                <strong>{project.title}</strong>
                                <span
                                    className={styles.statusChip}
                                    data-status={project.status}
                                >
                                    {project.status}
                                </span>
                            </div>
                            <p className={styles.projectMetaLine}>
                                {project.category} ·{" "}
                                {project.featured ? "Featured" : "Standard"} ·{" "}
                                {project.updateCount} update
                                {project.updateCount === 1 ? "" : "s"}
                            </p>
                            <p>{project.shortDescription}</p>
                            <small className={styles.imageNote}>
                                {project.coverImage
                                    ? "Cover image set"
                                    : "No cover image"}{" "}
                                ·{" "}
                                {project.images?.length
                                    ? `${project.images.length} additional image${
                                          project.images.length === 1
                                              ? ""
                                              : "s"
                                      }`
                                    : "no additional images"}
                            </small>
                            <div className={styles.cardActions}>
                                <button
                                    type="button"
                                    onClick={() => startEditProject(project)}
                                >
                                    Edit project
                                </button>
                                <button
                                    type="button"
                                    className={styles.removeButton}
                                    onClick={() => deleteProject(project)}
                                    disabled={loading}
                                >
                                    Delete
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        toggleUpdatesPanel(project._id)
                                    }
                                    disabled={loading}
                                >
                                    {openUpdatesFor === project._id
                                        ? "Hide updates"
                                        : `Updates (${project.updateCount})`}
                                </button>
                            </div>
                            {openUpdatesFor === project._id ? (
                                <div className={styles.updatesPanel}>
                                    <div
                                        className={styles.updatesPanelHeader}
                                    >
                                        <strong>Project updates</strong>
                                        <button
                                            type="button"
                                            className={styles.addButton}
                                            onClick={startCreateUpdate}
                                        >
                                            Add update
                                        </button>
                                    </div>
                                    {updateForm &&
                                    updateForm.projectId ===
                                        project._id ? (
                                        <form
                                            className={styles.portfolioForm}
                                            onSubmit={saveUpdate}
                                        >
                                            <div
                                                className={styles.editorGrid}
                                            >
                                                <label
                                                    className={
                                                        styles.editorField
                                                    }
                                                >
                                                    <span>Update title</span>
                                                    <input
                                                        value={
                                                            updateValues.title
                                                        }
                                                        onChange={(event) =>
                                                            setUpdateField(
                                                                "title",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        required
                                                        maxLength={160}
                                                    />
                                                </label>
                                                <label
                                                    className={
                                                        styles.editorField
                                                    }
                                                >
                                                    <span>Date</span>
                                                    <input
                                                        type="date"
                                                        value={
                                                            updateValues.date
                                                        }
                                                        onChange={(event) =>
                                                            setUpdateField(
                                                                "date",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </label>
                                            </div>
                                            <label
                                                className={styles.editorField}
                                            >
                                                <span>
                                                    Update description
                                                </span>
                                                <textarea
                                                    rows={3}
                                                    value={
                                                        updateValues.description
                                                    }
                                                    onChange={(event) =>
                                                        setUpdateField(
                                                            "description",
                                                            event.target
                                                                .value,
                                                        )
                                                    }
                                                    required
                                                    maxLength={4000}
                                                />
                                            </label>
                                            <div className={styles.editorGrid}>
                                                <label
                                                    className={
                                                        styles.editorField
                                                    }
                                                >
                                                    <span>
                                                        Technologies / features
                                                        added (comma separated)
                                                    </span>
                                                    <input
                                                        value={
                                                            updateValues.technologies
                                                        }
                                                        onChange={(event) =>
                                                            setUpdateField(
                                                                "technologies",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </label>
                                                <label
                                                    className={
                                                        styles.editorField
                                                    }
                                                >
                                                    <span>
                                                        External link (optional)
                                                    </span>
                                                    <input
                                                        type="url"
                                                        value={
                                                            updateValues.link
                                                        }
                                                        onChange={(event) =>
                                                            setUpdateField(
                                                                "link",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="https://"
                                                    />
                                                </label>
                                            </div>
                                            <label
                                                className={styles.editorField}
                                            >
                                                <span>
                                                    Images (one URL per line)
                                                </span>
                                                <textarea
                                                    rows={2}
                                                    value={updateValues.images}
                                                    onChange={(event) =>
                                                        setUpdateField(
                                                            "images",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </label>
                                            <div
                                                className={styles.cardActions}
                                            >
                                                <button
                                                    type="submit"
                                                    className={
                                                        styles.submitButton
                                                    }
                                                    disabled={loading}
                                                >
                                                    {updateForm.mode ===
                                                    "create"
                                                        ? "Add update"
                                                        : "Save update"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUpdateForm(null);
                                                        setUpdateValues(
                                                            emptyUpdateForm,
                                                        );
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : null}
                                    {updates.length === 0 ? (
                                        <p className={styles.empty}>
                                            No updates yet for this project.
                                        </p>
                                    ) : (
                                        updates.map((update) => (
                                            <div
                                                className={styles.updateItem}
                                                key={update._id}
                                            >
                                                <div
                                                    className={
                                                        styles.updateItemTop
                                                    }
                                                >
                                                    <strong>
                                                        {update.title}
                                                    </strong>
                                                    <time
                                                        dateTime={update.date}
                                                    >
                                                        {formatPortfolioDate(
                                                            update.date,
                                                        )}
                                                    </time>
                                                </div>
                                                <p>{update.description}</p>
                                                {update.technologies &&
                                                update.technologies.length >
                                                    0 ? (
                                                    <div
                                                        className={
                                                            styles.chipRow
                                                        }
                                                    >
                                                        {update.technologies.map(
                                                            (technology) => (
                                                                <span
                                                                    className={
                                                                        styles.chip
                                                                    }
                                                                    key={
                                                                        technology
                                                                    }
                                                                >
                                                                    {
                                                                        technology
                                                                    }
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : null}
                                                <div
                                                    className={
                                                        styles.updateActions
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            startEditUpdate(
                                                                update,
                                                            )
                                                        }
                                                        disabled={loading}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.removeButton
                                                        }
                                                        onClick={() =>
                                                            deleteUpdate(
                                                                update,
                                                            )
                                                        }
                                                        disabled={loading}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : null}
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}
