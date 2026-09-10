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
};

export default function CompanyPage({
    eyebrow,
    title,
    description,
    signal,
    sectionLabel,
    sectionTitle,
    cards,
}: CompanyPageProps) {
    return (
        <main className={styles.page}>
            <nav className={styles.nav} aria-label="Company page navigation">
                <Link
                    className={styles.brand}
                    href="/"
                    aria-label="Nexora home"
                >
                    <span className={styles.brandMark} aria-hidden="true">
                        N
                    </span>
                    <span>Nexora</span>
                </Link>
                <Link className={styles.backLink} href="/">
                    <span aria-hidden="true">←</span> Back to studio
                </Link>
                <Link className={styles.navCta} href="/#contact">
                    Start a project <span aria-hidden="true">↗</span>
                </Link>
            </nav>
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
