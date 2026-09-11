import styles from "./Industries.module.css";
import { defaultHomeContent, type HomeContent } from "../../homeContent";

export default function Industries({
    industries = defaultHomeContent.industries,
}: {
    industries?: HomeContent["industries"];
}) {
    return (
        <section className={styles.industries} id="industries">
            <div className={styles.intro}>
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
                {industries.map((industry) => (
                    <article className={styles.industry} key={industry.number}>
                        <div className={styles.industryTop}>
                            <span>{industry.number}</span>
                            <span>{industry.name}</span>
                        </div>
                        <h3>{industry.title}</h3>
                        <p>{industry.text}</p>
                        <small>{industry.outcomes}</small>
                    </article>
                ))}
            </div>
        </section>
    );
}
