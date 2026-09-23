import Link from "next/link";
import { categories } from "../services";
import styles from "./page.module.css";

export default function WhatWeDoPage() {
    return (
        <main className={styles.page} data-motion-page>
            <section className={styles.hero}>
                <div data-motion="hero-copy">
                    <p className={styles.kicker}>What we do</p>
                    <h1>Digital support for the parts of business that need to <em>move better.</em></h1>
                    <p>From your first impression online to the systems your team uses every day, Nexora makes technology clear, useful, and ready for real life.</p>
                </div>
                <img data-motion="hero-media" src="/programmer.jpg" alt="Professional planning digital work" />
            </section>
            <section className={styles.intro}>
                <p className={styles.kicker}>How we can help</p>
                <h2>Choose the change that will make the <em>biggest difference.</em></h2>
            </section>
            <section className={styles.grid}>
                {categories.map((item, index) => (
                    <article id={item.slug} key={item.slug} data-motion="image" style={{ animation: `nxFadeUp .65s var(--ease-out) ${index * 70}ms both` }}>
                        <img src={item.image} alt={item.alt} />
                        <div><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.shortDescription}</p><Link href="/#contact">Talk about this <b>→</b></Link></div>
                    </article>
                ))}
            </section>
            <section className={styles.banner}>
                <div><p className={styles.kicker}>Not sure where to begin?</p><h2>Tell us what&apos;s getting in the way. We&apos;ll help you find the next sensible step.</h2></div>
                <Link href="/#contact" data-motion="cta">Start a conversation <span>→</span></Link>
            </section>
        </main>
    );
}
