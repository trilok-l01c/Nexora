"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Contact from "./components/home/Contact";
import Footer from "./components/home/Footer";
import Reveal from "./components/motion/Reveal";
import HeroSlider from "./components/home/HeroSlider";
import styles from "./page.module.css";
import { apiUrl } from "./apiConfig";
import { defaultHomeContent, normaliseHomeContent } from "./homeContent";

export default function Home() {
    const [content, setContent] = useState(defaultHomeContent);
    useEffect(() => {
        fetch(`${apiUrl}/api/home`, { cache: "no-store" })
            .then((response) => response.ok ? response.json() : null)
            .then((result) => result?.success && setContent(normaliseHomeContent(result.data)))
            .catch(() => undefined);
    }, []);
    return (
        <main className={styles.page} data-motion-page>
            <HeroSlider slides={content.heroSlides} />
            <section className={styles.intro}>
                <Reveal variant="up">
                    <p className={styles.kicker}>
                        {content.intro.kicker}
                    </p>
                </Reveal>
                <Reveal variant="up" delay={100}>
                    <h2>
                        {content.intro.title}{" "}<em>{content.intro.emphasis}</em>
                    </h2>
                    <p>
                        {content.intro.text}
                    </p>
                </Reveal>
            </section>
            <section className={styles.services}>
                {content.services.map(({ title, text, image, alt }, index) => (
                    <Reveal key={`${title}-${index}`} delay={index * 90}>
                        <article className={styles.service}>
                            <div className={styles.serviceMedia}>
                                <img
                                    src={image}
                                    alt={alt}
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                            <div className={styles.serviceMeta}>
                                <span>{String(index + 1).padStart(2, "0")}</span>
                                <div className={styles.icon} aria-hidden="true">
                                    ✦
                                </div>
                            </div>
                            <h3>{title}</h3>
                            <p>{text}</p>
                            <Link href="/what-we-do">
                                Explore service <b>&#8594;</b>
                            </Link>
                        </article>
                    </Reveal>
                ))}
            </section>
            <section className={styles.story}>
                <Reveal className={styles.storyPhoto} variant="left">
                        <img src={content.story.image} alt={content.story.imageAlt} />
                </Reveal>
                <Reveal
                    className={styles.storyCopy}
                    variant="right"
                    delay={100}
                >
                    <p className={styles.kicker}>
                        {content.story.kicker}
                    </p>
                    <h2>
                        {content.story.title}{" "}<em>{content.story.emphasis}</em>
                    </h2>
                    <p>
                        {content.story.text}
                    </p>
                    <Link href="/who-we-are" className={styles.secondary}>
                        {content.story.linkLabel} <span>&#8594;</span>
                    </Link>
                </Reveal>
            </section>
            <section className={styles.work}>
                <Reveal className={styles.sectionHeading}>
                    <div>
                        <p className={styles.kicker}>{content.work.kicker}</p>
                        <h2>{content.work.title}</h2>
                    </div>
                    <Link href="/portfolio" className={styles.textLink}>
                        {content.work.linkLabel} <span>&#8594;</span>
                    </Link>
                </Reveal>
                <div className={styles.workGrid}>
                    <Reveal variant="left">
                        <article className={styles.workLarge}>
                            <img
                                src={content.work.primary.image}
                                alt={content.work.primary.alt}
                            />
                            <div>
                                <p>{content.work.primary.label}</p>
                                <h3>{content.work.primary.title}</h3>
                            </div>
                        </article>
                    </Reveal>
                    <Reveal variant="right" delay={100}>
                        <article className={styles.workSmall}>
                            <img
                                src={content.work.secondary.image}
                                alt={content.work.secondary.alt}
                            />
                            <div>
                                <p>{content.work.secondary.label}</p>
                                <h3>{content.work.secondary.title}</h3>
                            </div>
                        </article>
                    </Reveal>
                </div>
            </section>
            <section className={styles.reasons}>
                <Reveal>
                    <p className={styles.kicker}>
                        {content.reasons.kicker}
                    </p>
                </Reveal>
                <div className={styles.reasonGrid}>
                    {content.reasons.items.map(({ title, text }, index) => {
                        return (
                            <Reveal key={title} delay={index * 100}>
                                <div>
                                    <b>0{index + 1}</b>
                                    <h3>{title}</h3>
                                    <p>{text}</p>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </section>
            <Contact />
            <Footer />
        </main>
    );
}
