import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./project.module.css";
import {
    formatPortfolioDate,
    type PortfolioProjectDetail,
} from "../../portfolioTypes";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
    params: Promise<{ projectId: string }>;
};

async function loadProject(
    projectId: string,
): Promise<PortfolioProjectDetail | null> {
    try {
        const response = await fetch(
            `${apiUrl}/api/portfolio/${projectId}`,
            { cache: "no-store" },
        );
        const result = await response.json();
        if (response.ok && result.success && result.data) {
            return result.data as PortfolioProjectDetail;
        }
    } catch {
        return null;
    }
    return null;
}

export async function generateMetadata({
    params,
}: ProjectPageProps): Promise<Metadata> {
    const { projectId } = await params;
    const project = await loadProject(projectId);
    if (!project) {
        return { title: "Portfolio | Nexora" };
    }
    return {
        title: `${project.title} | Nexora`,
        description: project.shortDescription,
        openGraph: {
            title: project.title,
            description: project.shortDescription,
            type: "article",
            images: project.coverImage
                ? [{ url: project.coverImage }]
                : undefined,
        },
    };
}

export default async function PortfolioProjectPage({
    params,
}: ProjectPageProps) {
    const { projectId } = await params;
    const project = await loadProject(projectId);
    if (!project) {
        notFound();
    }

    const descriptionParagraphs = (project.description || "")
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
    const updates = project.updates || [];
    const hasScope =
        (project.services?.length ?? 0) + (project.technologies?.length ?? 0) >
        0;

    return (
        <main className={styles.page}>
            <div className={styles.backBar}>
                <Link className={styles.backLink} href="/portfolio">
                    ← Portfolio
                </Link>
            </div>
            <header className={styles.hero}>
                <div className={styles.heroMeta}>
                    <p>NX / {project.category}</p>
                    <span>Case study</span>
                </div>
                <p className={styles.kicker}>{project.category}</p>
                <h1>{project.title}</h1>
                <p className={styles.intro}>{project.shortDescription}</p>
                <div className={styles.metaRow}>
                    <span className={styles.metaChip}>{project.status}</span>
                    {project.completionDate ? (
                        <span className={styles.metaChip}>
                            <time dateTime={project.completionDate}>
                                {formatPortfolioDate(project.completionDate)}
                            </time>
                        </span>
                    ) : null}
                    {project.services && project.services.length > 0 ? (
                        <span className={styles.metaChip}>
                            {project.services.length} service
                            {project.services.length === 1 ? "" : "s"}
                        </span>
                    ) : null}
                </div>
                {project.projectUrl ? (
                    <p className={styles.heroActions}>
                        <a
                            className={styles.primaryButton}
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Visit project <span aria-hidden="true">↗</span>
                        </a>
                    </p>
                ) : null}
            </header>
            {project.coverImage ? (
                <figure className={styles.cover}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={project.coverImage}
                        alt={`${project.title} cover image`}
                    />
                </figure>
            ) : null}
            {descriptionParagraphs.length > 0 ? (
                <section className={styles.about}>
                    <div>
                        <p className={styles.kicker}>About the project</p>
                        <h2>
                            What it is,
                            <br />
                            <em>what it does.</em>
                        </h2>
                    </div>
                    <div className={styles.aboutText}>
                        {descriptionParagraphs.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </section>
            ) : null}
            {hasScope ? (
                <section className={styles.scope}>
                    <div>
                        <p className={styles.kicker}>Scope</p>
                        <h2>
                            The useful
                            <br />
                            details.
                        </h2>
                    </div>
                    <div className={styles.scopeLists}>
                        {project.services && project.services.length > 0 ? (
                            <div>
                                <p className={styles.scopeListTitle}>
                                    Services provided
                                </p>
                                <ul className={styles.scopeList}>
                                    {project.services.map((service) => (
                                        <li key={service}>{service}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                        {project.technologies &&
                        project.technologies.length > 0 ? (
                            <div>
                                <p className={styles.scopeListTitle}>
                                    Technologies
                                </p>
                                <div className={styles.chipRow}>
                                    {project.technologies.map((technology) => (
                                        <span
                                            className={styles.chip}
                                            key={technology}
                                        >
                                            {technology}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </section>
            ) : null}
            {project.images && project.images.length > 0 ? (
                <section className={styles.gallery}>
                    <p className={styles.kicker}>Gallery</p>
                    <div className={styles.galleryGrid}>
                        {project.images.map((image, index) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={`${image}-${index}`}
                                src={image}
                                alt={`${project.title} project image ${index + 1}`}
                                loading="lazy"
                            />
                        ))}
                    </div>
                </section>
            ) : null}
            <section className={styles.updates}>
                <div>
                    <p className={styles.kicker}>How it evolved</p>
                    <h2>
                        Project
                        <br />
                        <em>updates.</em>
                    </h2>
                </div>
                {updates.length === 0 ? (
                    <p className={styles.updatesEmpty}>
                        No updates have been published for this project yet.
                    </p>
                ) : (
                    <div className={styles.updateList}>
                        {updates.map((update) => (
                            <article
                                className={styles.updateItem}
                                key={update._id}
                            >
                                <time dateTime={update.date}>
                                    {formatPortfolioDate(update.date)}
                                </time>
                                <div>
                                    <h3>{update.title}</h3>
                                    <p>{update.description}</p>
                                    {update.technologies &&
                                    update.technologies.length > 0 ? (
                                        <div className={styles.chipRow}>
                                            {update.technologies.map(
                                                (technology) => (
                                                    <span
                                                        className={styles.chip}
                                                        key={technology}
                                                    >
                                                        {technology}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    ) : null}
                                    {update.images &&
                                    update.images.length > 0 ? (
                                        <div className={styles.updateImages}>
                                            {update.images.map(
                                                (image, index) => (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        key={`${image}-${index}`}
                                                        src={image}
                                                        alt={`${update.title} image ${index + 1}`}
                                                        loading="lazy"
                                                    />
                                                ),
                                            )}
                                        </div>
                                    ) : null}
                                    {update.link ? (
                                        <a
                                            className={styles.updateLink}
                                            href={update.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Related link{" "}
                                            <span aria-hidden="true">↗</span>
                                        </a>
                                    ) : null}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
            <section className={styles.contactCTA}>
                <p className={styles.kicker}>Make a move</p>
                <h2>
                    Let&apos;s make
                    <br />
                    good progress.
                </h2>
                <a
                    className={styles.primaryButton}
                    href="mailto:hello@nexora.studio"
                >
                    hello@nexora.studio <span aria-hidden="true">↗</span>
                </a>
            </section>
        </main>
    );
}
