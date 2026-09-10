import styles from "./page.module.css";

export default function Home() {
    return (
        <main className={styles.page}>
            <nav className={styles.nav} aria-label="Main navigation">
                <a
                    className={styles.brand}
                    href="#top"
                    aria-label="Nexora home"
                >
                    <span className={styles.brandMark} aria-hidden="true">
                        N
                    </span>
                    <span>Nexora</span>
                </a>
                <div className={styles.navLinks}>
                    <a href="#solutions">Solutions</a>
                    <a href="#approach">Approach</a>
                    <a href="#about">About</a>
                </div>
                <a className={styles.navCta} href="#contact">
                    Start a project <span aria-hidden="true">↗</span>
                </a>
            </nav>
            <section className={styles.hero} id="top">
                <div className={styles.heroCopy}>
                    <p className={styles.eyebrow}>
                        <span className={styles.eyebrowDot} /> Independent
                        digital studio / 2026
                    </p>
                    <h1>
                        Build what
                        <br />
                        <em>moves</em> people.
                    </h1>
                    <p className={styles.heroText}>
                        Nexora turns ambitious ideas into intelligent digital
                        products, from the first line of code to the last
                        meaningful interaction.
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
                        <span className={styles.orbitOne} />
                        <span className={styles.orbitTwo} />
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
            <div className={styles.ticker} aria-hidden="true">
                <span>Full-stack development</span>
                <b>✳</b>
                <span>Intelligent systems</span>
                <b>✳</b>
                <span>Digital momentum</span>
                <b>✳</b>
                <span>Human-first technology</span>
                <b>✳</b>
            </div>
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
                    <article
                        className={`${styles.solutionCard} ${styles.featuredCard}`}
                    >
                        <div className={styles.cardNumber}>01</div>
                        <div>
                            <p className={styles.cardLabel}>Build</p>
                            <h3>
                                Digital products
                                <br />
                                with a pulse.
                            </h3>
                            <p className={styles.cardText}>
                                End-to-end web and mobile products engineered
                                for speed, scale, and the people using them.
                            </p>
                            <a href="#contact" className={styles.cardLink}>
                                See how we build <span>↗</span>
                            </a>
                        </div>
                        <div className={styles.cardPattern} aria-hidden="true">
                            <span />
                            <span />
                            <span />
                            <span />
                        </div>
                    </article>
                    <article className={styles.solutionCard}>
                        <div className={styles.cardNumber}>02</div>
                        <p className={styles.cardLabel}>Multiply</p>
                        <h3>
                            AI that works
                            <br />
                            for your team.
                        </h3>
                        <p className={styles.cardText}>
                            AI agents and practical integrations that remove
                            friction and create room for better work.
                        </p>
                        <a href="#contact" className={styles.cardLink}>
                            Explore AI systems <span>↗</span>
                        </a>
                    </article>
                    <article className={styles.solutionCard}>
                        <div className={styles.cardNumber}>03</div>
                        <p className={styles.cardLabel}>Understand</p>
                        <h3>
                            Data into
                            <br />
                            direction.
                        </h3>
                        <p className={styles.cardText}>
                            Data analysis and clear decision tools that reveal
                            what is happening and what to do next.
                        </p>
                        <a href="#contact" className={styles.cardLink}>
                            Find your signal <span>↗</span>
                        </a>
                    </article>
                    <article className={styles.solutionCard}>
                        <div className={styles.cardNumber}>04</div>
                        <p className={styles.cardLabel}>Connect</p>
                        <h3>
                            Presence that
                            <br />
                            gets noticed.
                        </h3>
                        <p className={styles.cardText}>
                            Social media management and content systems that
                            make your brand impossible to scroll past.
                        </p>
                        <a href="#contact" className={styles.cardLink}>
                            Shape your story <span>↗</span>
                        </a>
                    </article>
                </div>
            </section>
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
            <section className={styles.contact} id="contact">
                <p className={styles.kicker}>03 / Make a move</p>
                <h2>
                    Have a good
                    <br />
                    <em>feeling</em> about this?
                </h2>
                <a
                    className={styles.contactButton}
                    href="mailto:hello@nexora.studio"
                >
                    hello@nexora.studio <span>↗</span>
                </a>
            </section>
            <footer className={styles.footer} id="about">
                <a className={styles.brand} href="#top">
                    <span className={styles.brandMark} aria-hidden="true">
                        N
                    </span>
                    <span>Nexora</span>
                </a>
                <span>Independent technology studio / Nairobi · Worldwide</span>
                <span>© 2026 Nexora</span>
            </footer>
        </main>
    );
}
