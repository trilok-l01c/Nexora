import Link from "next/link";
import styles from "./page.module.css";

const values = [
    ["indian-programmer.jpg", "Professional working on a computer", "Start with what matters", "Every project begins with the people, customers, and workflows it needs to support."],
    ["team-work.jpg", "Team working together", "Work side by side", "You stay close to the decisions, with a team that explains the why as clearly as the how."],
    ["indian-building.jpg", "Business building in India", "Build for the next step", "We focus on useful foundations that support where your business is going."],
];

export default function WhoWeArePage() {
    return <main className={styles.page} data-motion-page>
        <section className={styles.hero}><div data-motion="hero-copy"><p className={styles.kicker}>Who we are</p><h1>Practical people building <em>useful digital things.</em></h1><p>We believe technology should help good businesses do their best work—not create another layer of complication.</p><Link href="/#contact" className={styles.button} data-motion="cta">Talk to our team <span>→</span></Link></div><figure data-motion="hero-media"><img src="/working-peoples-2.jpg" alt="Colleagues collaborating at work" /><figcaption>Clear thinking, thoughtful delivery.</figcaption></figure></section>
        <section className={styles.connection}><div className={styles.parent}><span>Parent company</span><strong>GRV Research<br />and Solutions</strong></div><div className={styles.arrow}>↓</div><div className={styles.brand}><span>Digital solutions business</span><strong><i>N</i> Nexora</strong></div></section>
        <section className={styles.story}><div><p className={styles.kicker}>The Nexora approach</p><h2>Big enough to make progress. <em>Close enough to care.</em></h2></div><p>Nexora is part of GRV Research and Solutions. Together, we bring a considered, problem-solving approach to the digital needs of businesses. Our role is simple: listen well, make the complicated parts clear, and build something that genuinely helps.</p></section>
        <section className={styles.values}>{values.map(([image, alt, title, text], index) => <article key={title} data-motion="image" style={{ animation: `nxFadeUp .65s var(--ease-out) ${index * 90}ms both` }}><img src={`/${image}`} alt={alt} /><h3>{title}</h3><p>{text}</p></article>)}</section>
        <section className={styles.closing}><p className={styles.kicker}>A conversation is a good place to start</p><h2>Let&apos;s make your next digital move feel <em>straightforward.</em></h2><Link href="/#contact" className={styles.button} data-motion="cta">Get in touch <span>→</span></Link></section>
    </main>;
}
