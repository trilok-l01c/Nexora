"use client";

import styles from "./Industries.module.css";
import { defaultHomeContent, type HomeContent } from "../../homeContent";
import { useReveal } from "../../useReveal";

type IndustryItem = HomeContent["industries"][number];

// Each tile observes itself so it animates as it arrives; the delay only
// staggers the three tiles that share a row.
function Industry({
    industry,
    index,
}: {
    industry: IndustryItem;
    index: number;
}) {
    const reveal = useReveal<HTMLElement>({ delay: (index % 3) * 80 });

    return (
        <article className={styles.industry} {...reveal}>
            <div className={styles.industryTop}>
                <span>{industry.number}</span>
                <span>{industry.name}</span>
            </div>
            <h3>{industry.title}</h3>
            <p>{industry.text}</p>
            <small>{industry.outcomes}</small>
        </article>
    );
}

export default function Industries({
    industries = defaultHomeContent.industries,
}: {
    industries?: HomeContent["industries"];
}) {
    const introReveal = useReveal<HTMLDivElement>();

    return (
        <section className={styles.industries} id="industries">
            <div className={styles.intro} {...introReveal}>
                <p className={styles.kicker}>02 / Where we help</p>
                <h2>
                    Technology that
                    <br />
                    understands your <em>world.</em>
                </h2>
                <p className={styles.introText}>
                    Every industry has its own pace, pressure, and definition of
                    progress. We shape practical systems around the way your
                    people actually work.
                </p>
            </div>
            <div className={styles.industryGrid}>
                {industries.map((industry, index) => (
                    <Industry
                        industry={industry}
                        index={index}
                        key={industry.number}
                    />
                ))}
            </div>
        </section>
    );
}
