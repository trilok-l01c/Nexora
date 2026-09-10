import Link from "next/link";
import styles from "./Solutions.module.css";

const cards = [
    {
        number: "01",
        label: "Build",
        title: (
            <>
                Digital products
                <br />
                with a pulse.
            </>
        ),
        text: "End-to-end web and mobile products engineered for speed, scale, and the people using them.",
        href: "/services/software-development",
        link: "See how we build",
        featured: true,
    },
    {
        number: "02",
        label: "Multiply",
        title: (
            <>
                AI that works
                <br />
                for your team.
            </>
        ),
        text: "AI agents and practical integrations that remove friction and create room for better work.",
        href: "/services/ai-systems",
        link: "Explore AI systems",
    },
    {
        number: "03",
        label: "Understand",
        title: (
            <>
                Data into
                <br />
                direction.
            </>
        ),
        text: "Data analysis and clear decision tools that reveal what is happening and what to do next.",
        href: "/services/data-analysis",
        link: "Find your signal",
    },
    {
        number: "04",
        label: "Connect",
        title: (
            <>
                Presence that
                <br />
                gets noticed.
            </>
        ),
        text: "Social media management and content systems that make your brand impossible to scroll past.",
        href: "/services/digital-presence",
        link: "Shape your story",
    },
];

export default function Solutions() {
    return (
        <section className={styles.solutions} id="solutions">
            <div className={styles.sectionIntro}>
                <p className={styles.kicker}>01 / What we do</p>
                <h2>
                    Complex made
                    <br />
                    <span>clear.</span>
                </h2>
            </div>
            <div className={styles.solutionGrid}>
                {cards.map((card) => (
                    <article
                        className={`${styles.solutionCard} ${card.featured ? styles.featuredCard : ""}`}
                        key={card.number}
                    >
                        <div className={styles.cardNumber}>{card.number}</div>
                        <div>
                            <p className={styles.cardLabel}>{card.label}</p>
                            <h3>{card.title}</h3>
                            <p className={styles.cardText}>{card.text}</p>
                            <Link href={card.href} className={styles.cardLink}>
                                {card.link} <span>↗</span>
                            </Link>
                        </div>
                        {card.featured && (
                            <div
                                className={styles.cardPattern}
                                aria-hidden="true"
                            >
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
}
