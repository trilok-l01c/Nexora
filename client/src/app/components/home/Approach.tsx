import styles from "./Approach.module.css";

export default function Approach() {
    return (
        <section className={styles.approach} id="approach">
            <div className={styles.approachMeta}>
                <p className={styles.kicker}>02 / Our approach</p>
                <p className={styles.metaNote}>
                    Small team. Big range.
                    <br />
                    Always in your corner.
                </p>
            </div>
            <div className={styles.approachCopy}>
                <h2>
                    Good technology
                    <br />
                    should feel like
                    <br />
                    <em>good energy.</em>
                </h2>
                <p>
                    We bring strategy, design, engineering, and intelligence
                    into one room. No handoffs into the void. No mystery
                    timelines. Just thoughtful work that keeps moving.
                </p>
                <a className={styles.textLink} href="#contact">
                    Meet your new tech partner <span>↗</span>
                </a>
            </div>
            <div className={styles.stats}>
                <div>
                    <strong>
                        12<span>+</span>
                    </strong>
                    <small>
                        industries
                        <br />
                        served
                    </small>
                </div>
                <div>
                    <strong>
                        4.9<span>★</span>
                    </strong>
                    <small>
                        partner
                        <br />
                        rating
                    </small>
                </div>
                <div>
                    <strong>∞</strong>
                    <small>
                        ways to
                        <br />
                        move forward
                    </small>
                </div>
            </div>
        </section>
    );
}
