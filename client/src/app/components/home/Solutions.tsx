import Link from "next/link";
import { defaultHomeContent, type HomeContent } from "../../homeContent";
import styles from "./Solutions.module.css";

export default function Solutions({
    cards = defaultHomeContent.solutions,
}: {
    cards?: HomeContent["solutions"];
}) {
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
