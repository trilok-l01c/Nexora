"use client";

import Link from "next/link";
import { defaultHomeContent, type HomeContent } from "../../homeContent";
import { useReveal } from "../../useReveal";
import styles from "./Solutions.module.css";

type SolutionCard = HomeContent["solutions"][number];

// Each card observes its own position so it animates as it scrolls into view.
// The delay only staggers the two cards of a shared row, which keeps the
// cascade crisp without making lower rows wait on a growing queue.
function Solution({ card, index }: { card: SolutionCard; index: number }) {
    const reveal = useReveal<HTMLElement>({
        delay: (index % 2) * 90,
    });

    return (
        <article
            className={`${styles.solutionCard} ${card.featured ? styles.featuredCard : ""}`}
            {...reveal}
        >
            <div className={styles.cardNumber}>{card.number}</div>
            <div>
                <p className={styles.cardLabel}>{card.label}</p>
                <h3>
                    {card.title}
                    <br />
                    {card.titleSecondLine}
                </h3>
                <p className={styles.cardText}>{card.text}</p>
                <Link href={card.href} className={styles.cardLink}>
                    {card.link} <span>↗</span>
                </Link>
            </div>
            {card.featured && (
                <div className={styles.cardPattern} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                </div>
            )}
        </article>
    );
}

export default function Solutions({
    cards = defaultHomeContent.solutions,
}: {
    cards?: HomeContent["solutions"];
}) {
    const introReveal = useReveal<HTMLDivElement>();

    return (
        <section className={styles.solutions} id="solutions">
            <div className={styles.sectionIntro} {...introReveal}>
                <p className={styles.kicker}>01 / What we do</p>
                <h2>
                    Complex made
                    <br />
                    <span>clear.</span>
                </h2>
            </div>
            <div className={styles.solutionGrid}>
                {cards.map((card, index) => (
                    <Solution card={card} index={index} key={card.number} />
                ))}
            </div>
        </section>
    );
}
