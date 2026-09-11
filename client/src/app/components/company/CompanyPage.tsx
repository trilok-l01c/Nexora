import Link from "next/link";
import styles from "./CompanyPage.module.css";

type CompanyPageProps = {
    eyebrow: string;
    title: React.ReactNode;
    description: string;
    signal: string;
    sectionLabel: string;
    sectionTitle: React.ReactNode;
    cards: Array<{
        number: string;
        title: string;
        text: string;
    }>;
    projects: Array<{
        client: string;
        business: string;
        project: string;
        summary: string;
        services: string;
    }>;
};

export default function CompanyPage({
    eyebrow,
    title,
    description,
    signal,
    sectionLabel,
    sectionTitle,
    cards,
    projects,
}: CompanyPageProps) {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroMeta}>
                    <span>NX / {eyebrow}</span>
                    <span>Company / 2026</span>
                </div>
                <div className={styles.heroContent}>
                    <p className={styles.eyebrow}>{eyebrow} / Nexora</p>
                    <h1>{title}</h1>
                    <p className={styles.intro}>{description}</p>
                    <Link className={styles.primaryButton} href="/#contact">
                        Start a conversation <span aria-hidden="true">↗</span>
                    </Link>
                </div>
                <div className={styles.signal} aria-hidden="true">
                    <span>NEXORA / {eyebrow.toUpperCase()}</span>
                    <strong>{signal}</strong>
                    <i />
                    <small>Useful connections</small>
                </div>
            </section>
            <section className={styles.content}>
                <div className={styles.contentIntro}>
                    <p className={styles.kicker}>{sectionLabel}</p>
                    <h2>{sectionTitle}</h2>
                </div>
                <div className={styles.cardGrid}>
                    {cards.map((card) => (
                        <article className={styles.card} key={card.number}>
                            <div className={styles.cardTop}>
                                <span>{card.number}</span>
                                <i aria-hidden="true">↗</i>
                            </div>
                            <h3>{card.title}</h3>
                            <p>{card.text}</p>
                        </article>
                    ))}
                </div>
            </section>
            <section className={styles.projects}>
                <div className={styles.projectsIntro}>
                    <p className={styles.kicker}>02 / Illustrative work</p>
                    <h2>
                        Ideas shaped for
                        <br />
                        <em>real businesses.</em>
                    </h2>
                    <p className={styles.disclaimer}>
                        Placeholder projects for demonstration only. Real client
                        stories will be added as they become available.
                    </p>
                </div>
                <div className={styles.projectList}>
                    {projects.map((project, index) => (
                        <article
                            className={styles.project}
                            key={project.client}
                        >
                            <span className={styles.projectNumber}>
                                0{index + 1}
                            </span>
                            <div>
                                <p className={styles.projectClient}>
                                    {project.client}
                                </p>
                                <small>{project.business}</small>
                            </div>
                            <h3>{project.project}</h3>
                            <p className={styles.projectSummary}>
                                {project.summary}
                            </p>
                            <span className={styles.projectServices}>
                                {project.services}
                            </span>
                        </article>
                    ))}
                </div>
            </section>
            <section className={styles.contact}>
                <p className={styles.kicker}>03 / Make a move</p>
                <h2>
                    Good work starts
                    <br />
                    <em>with a hello.</em>
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
