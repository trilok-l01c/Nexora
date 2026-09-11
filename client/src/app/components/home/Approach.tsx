import styles from "./Approach.module.css";
import { defaultHomeContent, type HomeContent } from "../../homeContent";

export default function Approach({
    content = defaultHomeContent.approach,
    stats = defaultHomeContent.stats,
}: {
    content?: HomeContent["approach"];
    stats?: HomeContent["stats"];
}) {
    return (
        <section className={styles.approach} id="approach">
            <div className={styles.approachMeta}>
                <p className={styles.kicker}>02 / Our approach</p>
                <p className={styles.metaNote}>
                    {content.meta}
                    <br />
                    {content.metaSecondLine}
                </p>
            </div>
            <div className={styles.approachCopy}>
                <h2>
                    {content.title}
                    <br />
                    {content.titleSecondLine}
                    <br />
                    <em>{content.titleEmphasis}</em>
                </h2>
                <p>{content.text}</p>
                <a className={styles.textLink} href="#contact">
                    {content.linkLabel} <span>↗</span>
                </a>
            </div>
            <div className={styles.stats}>
                {stats.map((stat) => (
                    <div key={`${stat.value}-${stat.label}`}>
                        <strong>{stat.value}</strong>
                        <small>
                            {stat.label}
                            <br />
                            {stat.detail}
                        </small>
                    </div>
                ))}
            </div>
        </section>
    );
}
