import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";
import {
    formatPortfolioDate,
    type PortfolioProject,
} from "../portfolioTypes";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Portfolio | Nexora",
    description:
        "Selected Nexora projects across software development, AI systems, cloud infrastructure, and digital presence.",
};

async function loadPortfolioProjects(): Promise<PortfolioProject[] | null> {
    try {
        const response = await fetch(`${apiUrl}/api/portfolio`, {
            cache: "no-store",
        });
        const result = await response.json();
        if (response.ok && result.success && Array.isArray(result.data)) {
            return result.data as PortfolioProject[];
        }
    } catch {
        return null;
    }
    return null;
}

export default async function PortfolioPage() {
    const projects = await loadPortfolioProjects();
    const published = projects ?? [];

    return (
        <main className={styles.page}>
            <header className={styles.hero}>
                <div className={styles.heroCopy}>
                    <p className={styles.kicker}>Selected work</p>
                    <h1>Useful ideas, <em>made visible.</em></h1>
                    <p className={styles.intro}>A closer look at the digital experiences, systems, and foundations we create for businesses ready to move forward.</p>
                </div>
                <div className={styles.heroPhoto}><img src="/city-in-night.jpg" alt="City at night, representing connected digital business" /></div>
            </header>
            <section
                className={styles.listing}
                aria-label="Portfolio projects"
            >
                <div className={styles.listingHeader}>
                    <p className={styles.kicker}>The work</p>
                    <span className={styles.count}>
                        {published.length} project
                        {published.length === 1 ? "" : "s"}
                    </span>
                </div>
                {projects === null ? (
                    <p className={styles.emptyState}>
                        <strong>
                            The portfolio is temporarily unavailable.
                        </strong>
                        It will be back shortly. Please try again soon.
                    </p>
                ) : published.length === 0 ? (
                    <p className={styles.emptyState}>
                        <strong>The portfolio is being curated.</strong>
                        Projects are being prepared for publication. Check
                        back soon.
                    </p>
                ) : (
                    <div className={styles.projectGrid}>
                        {published.map((project) => (
                            <Link
                                key={project._id}
                                href={`/portfolio/${project._id}`}
                                className={`${styles.card}${
                                    project.featured
                                        ? ` ${styles.cardFeatured}`
                                        : ""
                                }`}
                            >
                                <span className={styles.cardMedia}>
                                    {project.coverImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={project.coverImage}
                                            alt=""
                                            loading="lazy"
                                        />
                                    ) : (
                                        <span
                                            className={styles.mediaPlaceholder}
                                            aria-hidden="true"
                                        >
                                            {project.category
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </span>
                                <span className={styles.cardBody}>
                                    <span className={styles.cardMeta}>
                                        <span className={styles.category}>
                                            {project.category}
                                        </span>
                                        {project.featured ? (
                                            <span
                                                className={styles.featuredBadge}
                                            >
                                                Featured
                                            </span>
                                        ) : null}
                                    </span>
                                    <h2 className={styles.cardTitle}>
                                        {project.title}
                                    </h2>
                                    <span className={styles.cardText}>
                                        {project.shortDescription}
                                    </span>
                                    {project.technologies &&
                                    project.technologies.length > 0 ? (
                                        <span className={styles.techLine}>
                                            {project.technologies
                                                .slice(0, 4)
                                                .join(" · ")}
                                        </span>
                                    ) : null}
                                    <span className={styles.cardFoot}>
                                        {project.completionDate ? (
                                            <time
                                                dateTime={
                                                    project.completionDate
                                                }
                                            >
                                                {formatPortfolioDate(
                                                    project.completionDate,
                                                )}
                                            </time>
                                        ) : (
                                            <span />
                                        )}
                                        <span>View project ↗</span>
                                    </span>
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
            <section className={styles.contactCTA}>
                <p className={styles.kicker}>Make a move</p>
                <h2>
                    Want work like this?
                    <br />
                    <em>Let&apos;s build it.</em>
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
