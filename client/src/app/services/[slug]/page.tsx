import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allServices } from "../../services";
import styles from "./service.module.css";

type ServicePageProps = {
    params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
    return allServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
    params,
}: ServicePageProps): Promise<Metadata> {
    const { slug } = await params;
    const service = allServices.find((item) => item.slug === slug);

    return {
        title: service ? `${service.title} | Nexora` : "Service | Nexora",
        description: service?.description,
    };
}

export default async function ServicePage({ params }: ServicePageProps) {
    const { slug } = await params;
    const service = allServices.find((item) => item.slug === slug);

    if (!service) {
        notFound();
    }

    return (
        <main className={styles.page}>
            <nav className={styles.nav} aria-label="Service navigation">
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
                <a className={styles.navCta} href="mailto:hello@nexora.studio">
                    Start a project <span aria-hidden="true">↗</span>
                </a>
            </nav>
            <section className={styles.hero}>
                <div className={styles.heroMeta}>
                    <p>NX / {service.category}</p>
                    <span>Service / 2026</span>
                </div>
                <div className={styles.heroContent}>
                    <p className={styles.eyebrow}>
                        {service.category} / Nexora capability
                    </p>
                    <h1>{service.headline}</h1>
                    <p className={styles.intro}>{service.description}</p>
                    <a
                        className={styles.primaryButton}
                        href="mailto:hello@nexora.studio"
                    >
                        Start a conversation <span aria-hidden="true">↗</span>
                    </a>
                </div>
                <div className={styles.signal} aria-hidden="true">
                    <span className={styles.signalLabel}>NEXORA / SIGNAL</span>
                    <strong>
                        {service.category.slice(0, 2).toUpperCase()}
                    </strong>
                    <i />
                    <small>Clarity in motion</small>
                </div>
            </section>
            <section className={styles.details}>
                <div>
                    <p className={styles.kicker}>01 / What changes</p>
                    <h2>
                        Work that keeps
                        <br />
                        <em>moving forward.</em>
                    </h2>
                </div>
                <div className={styles.outcomes}>
                    {service.outcomes.map((outcome, index) => (
                        <div key={outcome}>
                            <span>0{index + 1}</span>
                            <strong>{outcome}</strong>
                        </div>
                    ))}
                </div>
            </section>
            <section className={styles.capabilities}>
                <p className={styles.kicker}>02 / How we help</p>
                <div>
                    <h2>
                        The useful
                        <br />
                        details.
                    </h2>
                    <ul>
                        {service.capabilities.map((capability) => (
                            <li key={capability}>{capability}</li>
                        ))}
                    </ul>
                </div>
            </section>
            <section className={styles.contact}>
                <p className={styles.kicker}>03 / Make a move</p>
                <h2>
                    Let&apos;s make
                    <br />
                    <em>good progress.</em>
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
