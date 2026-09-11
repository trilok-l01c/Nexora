import styles from "./Hero.module.css";

export default function Hero() {
    return (
        <section className={styles.hero} id="top">
            <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>
                    <span className={styles.eyebrowDot} /> Independent digital
                    studio / 2026
                </p>
                <h1>
                    Build what
                    <br />
                    <em>moves</em> people.
                </h1>
                <p className={styles.heroText}>
                    Nexora turns ambitious ideas into intelligent digital
                    products, from the first line of code to the last meaningful
                    interaction.
                </p>
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
