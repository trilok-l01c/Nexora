import styles from "./Hero.module.css";
import { defaultHomeContent, type HomeContent } from "../../homeContent";

export default function Hero({
    content = defaultHomeContent.hero,
}: {
    content?: HomeContent["hero"];
}) {
    return (
        <section className={styles.hero} id="top">
            <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>
                    <span className={styles.eyebrowDot} /> {content.eyebrow}
                </p>
                <h1>
                    {content.title}
                    <br />
                    <em>{content.titleEmphasis}</em> {content.titleSuffix}
                </h1>
                <p className={styles.heroText}>{content.text}</p>
                <div className={styles.heroActions}>
                    <a className={styles.buttonPrimary} href="#contact">
                        Tell us about it <span aria-hidden="true">↗</span>
                    </a>
                    <a className={styles.buttonQuiet} href="#solutions">
                        Explore solutions <span aria-hidden="true">↓</span>
                    </a>
                </div>
            </div>
            <div
                className={styles.signalBoard}
                aria-label="Nexora project signal board"
            >
                <div className={styles.boardTop}>
                    <span>NX / SIGNAL BOARD</span>
                    <span>
                        LIVE <i />
                    </span>
                </div>
                <div className={styles.boardOrb}>
                    <span
                        className={`${styles.orbitTrack} ${styles.orbitTrackOne}`}
                    >
                        <i />
                    </span>
                    <span
                        className={`${styles.orbitTrack} ${styles.orbitTrackTwo}`}
                    >
                        <i />
                    </span>
                    <span className={styles.orbCore}>NX</span>
                </div>
                <div className={styles.boardReadout}>
                    <span>PRODUCT VELOCITY</span>
                    <strong>
                        84.6 <small>%</small>
                    </strong>
                    <div className={styles.chart}>
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>
                </div>
                <div className={styles.boardBottom}>
                    <span>Strategy</span>
                    <span>Design</span>
                    <span>Systems</span>
                    <span>Launch ↗</span>
                </div>
            </div>
        </section>
    );
}
