"use client";

import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
} from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "./useGSAP";
import { apiUrl, resolveAssetUrl } from "../apiConfig";
import { type PortfolioProject, formatPortfolioDate } from "../portfolioTypes";
import { USE_DEMO_FALLBACK, demoProjects } from "./demoProjects";
import styles from "./page.module.css";

const fallbackImage = "/programmer.jpg";

export default function PortfolioPage() {
    const [projects, setProjects] = useState<PortfolioProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [usingDemo, setUsingDemo] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadProjects() {
            let loaded: PortfolioProject[] = [];

            try {
                const response = await fetch(`${apiUrl}/api/portfolio`, {
                    cache: "no-store",
                    signal: controller.signal,
                });
                const result = await response.json();
                if (
                    response.ok &&
                    result.success &&
                    Array.isArray(result.data)
                ) {
                    loaded = result.data as PortfolioProject[];
                }
            } catch {
                /* fall through to the sample case studies below */
            }

            // Never render an empty showcase: when the API is unreachable or
            // has nothing published, show the bundled sample case studies
            // instead (flagged in the UI so they are never mistaken for real
            // client work).
            let demo = false;
            if (loaded.length === 0 && USE_DEMO_FALLBACK) {
                loaded = demoProjects;
                demo = true;
            }

            if (controller.signal.aborted) return;

            // Single batched update so the empty state never flashes.
            setProjects(loaded);
            setUsingDemo(demo);
            setLoading(false);
        }

        loadProjects();
        return () => controller.abort();
    }, []);

    const pageRef = useRef<HTMLElement>(null);
    const { ready: gsapReady, reducedMotion } = useGSAP();
    // The scroll cue is pure instruction, so it retires as soon as the visitor
    // moves into the showcase and never comes back.
    const [hintRetired, setHintRetired] = useState(false);

    const featured = projects.length > 0 ? projects[0] : null;
    const heroMedia = featured
        ? resolveAssetUrl(featured.coverImage) ||
          (featured.images?.[0] && resolveAssetUrl(featured.images[0])) ||
          fallbackImage
        : "";

    useEffect(() => {
        const root = pageRef.current;
        if (!gsapReady || !root || loading || projects.length === 0) {
            return;
        }

        // Scope every animation to the page root so `gsap.context().revert()`
        // cleans up timelines, pins and ScrollTriggers on unmount/re-run.
        const ctx = gsap.context(() => {
            animateHero(root);
            animateProgressRail(root, reducedMotion);
            animateShowcase(root, reducedMotion, {
                onActiveChange: setActiveIndex,
                onFirstScroll: () => setHintRetired(true),
            });
        }, root);

        return () => ctx.revert();
    }, [gsapReady, loading, projects, reducedMotion]);

    return (
        <main className={styles.showcase} data-motion-page ref={pageRef}>
            <ShowcaseHero
                projects={projects}
                loading={loading}
                heroMedia={heroMedia}
            />

            {usingDemo ? (
                <p className={styles.demoNotice} role="note" data-demo-notice>
                    <strong>Sample case studies</strong>
                    <span>
                        Live project data is unavailable right now, so bundled
                        sample projects are shown instead.
                    </span>
                </p>
            ) : null}

            <ShowcaseProgress
                activeIndex={activeIndex}
                total={projects.length}
                category={projects[activeIndex]?.category}
                loading={loading}
                reducedMotion={reducedMotion}
            />

            <div
                className={styles.projects}
                data-projects-rail
                // The container is the scroll runway for the shared frame: one
                // viewport per project drives how far the stage can travel.
                style={
                    {
                        "--showcase-slots": projects.length || 1,
                    } as CSSProperties
                }
            >
                {loading ? (
                    <ShowcaseLoading />
                ) : projects.length === 0 ? (
                    <ShowcaseEmpty />
                ) : (
                    <div className={styles.showcaseStage} data-showcase-stage>
                        {projects.map((project, index) => (
                            <ProjectShowcase
                                key={project._id}
                                project={project}
                                index={index}
                                total={projects.length}
                            />
                        ))}

                        {projects.length > 1 ? (
                            <div
                                className={styles.scrollHint}
                                data-scroll-hint
                                data-retired={hintRetired ? "" : undefined}
                                aria-hidden={hintRetired}
                            >
                                <span className={styles.scrollHintText}>
                                    Scroll for more
                                </span>
                                <span
                                    className={styles.scrollHintLine}
                                    aria-hidden="true"
                                />
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            <ShowcaseContact />
        </main>
    );
}

/* --------------------------------------------------------------------------
 * Hero entrance (GSAP)
 * A single timeline for the hero: copy fades/slides in, the media image
 * scales in, and the project count fades up after the intro. This keeps
 * the hero feeling cinematic without touching every element in the page.
 * -------------------------------------------------------------------------- */

function animateHero(root: HTMLElement) {
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    const copy = root.querySelector<HTMLElement>("[data-hero-copy]");
    const title = root.querySelector<HTMLElement>("[data-hero-title]");
    const intro = root.querySelector<HTMLElement>("[data-hero-intro]");
    const count = root.querySelector<HTMLElement>("[data-hero-count]");
    const media = root.querySelector<HTMLElement>("[data-hero-media]");
    const mediaImg = root.querySelector<HTMLElement>("[data-hero-media] img");

    const copyTargets = [copy, title, intro, count].filter(
        (el): el is HTMLElement => !!el,
    );

    if (copyTargets.length === 0 && !media) return;

    if (reducedMotion) {
        gsap.set(
            [...copyTargets, media, mediaImg].filter(
                (el): el is HTMLElement => !!el,
            ),
            {
                autoAlpha: 1,
                y: 0,
                scale: 1,
            },
        );
        return;
    }

    gsap.set(copyTargets, { autoAlpha: 0, y: 24 });
    if (media) {
        gsap.set(media, { autoAlpha: 0 });
    }
    if (mediaImg) {
        gsap.set(mediaImg, { autoAlpha: 0, scale: 1.06 });
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    copyTargets.forEach((el, i) => {
        tl.to(el, { autoAlpha: 1, y: 0, duration: 0.7 }, i * 0.06);
    });

    if (mediaImg) {
        tl.to(
            mediaImg,
            { autoAlpha: 1, scale: 1, duration: 0.95, overwrite: "auto" },
            0.1,
        );
    }
    if (media) {
        tl.to(media, { autoAlpha: 1, duration: 0.5 }, 0.12);
    }
}

/* --------------------------------------------------------------------------
 * Progress rail
 * Scrubs the rail fill across the projects container so the rail always shows
 * how far through the case studies the visitor is. Reduced motion gets a
 * static fraction from React instead of a scroll-driven one.
 * -------------------------------------------------------------------------- */

function animateProgressRail(root: HTMLElement, reducedMotion: boolean) {
    if (reducedMotion) return;

    const fill = root.querySelector<HTMLElement>("[data-progress-fill]");
    const projects = root.querySelector<HTMLElement>("[data-projects-rail]");
    if (!fill || !projects) return;

    gsap.fromTo(
        fill,
        { width: "0%" },
        {
            width: "100%",
            ease: "none",
            scrollTrigger: {
                trigger: projects,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
                invalidateOnRefresh: true,
            },
        },
    );
}

/* --------------------------------------------------------------------------
 * Project showcase (GSAP ScrollTrigger)
 * -------------------------------------------------------------------------- */

interface ProjectShowcaseProps {
    project: PortfolioProject;
    index: number;
    total: number;
}

function ProjectShowcase({
    project,
    index,
    total,
}: ProjectShowcaseProps) {
    const resolvedImages = (project.images ?? [])
        .map(resolveAssetUrl)
        .filter(Boolean);
    const mediaSrc =
        resolveAssetUrl(project.coverImage) ||
        resolvedImages[0] ||
        fallbackImage;
    const technologies = (project.technologies ?? []).filter(Boolean);
    const services = (project.services ?? []).filter(Boolean);

    return (
        <section
            data-project-index={index}
            className={styles.project}
            aria-labelledby={`project-title-${index}`}
        >
            <div className={styles.projectFrame} data-pin-frame>
                <div className={styles.projectMedia} data-pin-media>
                    {mediaSrc ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            className={styles.mediaImg}
                            src={mediaSrc}
                            alt={project.title}
                            loading={index === 0 ? "eager" : "lazy"}
                            sizes="100vw"
                            data-parallax-media
                        />
                    ) : (
                        <div
                            className={styles.mediaPlaceholder}
                            aria-hidden="true"
                        >
                            {project.title}
                        </div>
                    )}

                    <div className={styles.mediaFringeTop} aria-hidden="true" />
                    <div
                        className={styles.mediaFringeBottom}
                        aria-hidden="true"
                    />
                </div>

                <div className={styles.projectOverlay}>
                    <div className={styles.overlayInner} data-reveal-inner>
                        <div className={styles.kickerRow} data-reveal-kicker>
                            <p className={styles.kicker}>
                                {project.category}
                                {project.featured ? (
                                    <span className={styles.featuredBadge}>
                                        Featured
                                    </span>
                                ) : null}
                            </p>

                            <span className={styles.counter} aria-hidden="true">
                                <span className={styles.counterCurrent}>
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                {" / "}
                                {String(total).padStart(2, "0")}
                            </span>
                        </div>

                        <h2
                            id={`project-title-${index}`}
                            className={styles.title}
                        >
                            {project.title}
                        </h2>

                        <p className={styles.description} data-reveal-desc>
                            {project.shortDescription}
                        </p>

                        <div className={styles.overlayFooter}>
                            {(technologies.length > 0 ||
                                services.length > 0) && (
                                <div
                                    className={styles.tagSection}
                                    data-reveal-tags
                                >
                                    {technologies.length > 0 && (
                                        <ul className={styles.tagList}>
                                            {technologies
                                                .slice(0, 6)
                                                .map((tech) => (
                                                    <li
                                                        key={tech}
                                                        className={styles.tag}
                                                    >
                                                        {tech}
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                    {services.length > 0 && (
                                        <ul className={styles.tagList}>
                                            {services
                                                .slice(0, 4)
                                                .map((service) => (
                                                    <li
                                                        key={service}
                                                        className={styles.tag}
                                                    >
                                                        {service}
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div
                                className={styles.overlayMeta}
                                data-reveal-meta
                            >
                                {project.completionDate ? (
                                    <time
                                        className={styles.date}
                                        dateTime={project.completionDate}
                                    >
                                        {formatPortfolioDate(
                                            project.completionDate,
                                        )}
                                    </time>
                                ) : null}
                                {project.projectUrl && (
                                    <span className={styles.liveLabel}>
                                        Live project
                                    </span>
                                )}
                            </div>

                            <Link
                                href={`/portfolio/${project._id}`}
                                className={styles.cta}
                                data-reveal-cta
                            >
                                View case study
                                <span aria-hidden="true">↗</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* --------------------------------------------------------------------------
 * Showcase stage (GSAP ScrollTrigger)
 * Every project shares ONE sticky stage. Scrolling the tall `.projects`
 * container scrubs a single trigger that cross-fades the stacked cards and
 * plays each card's existing staggered copy reveal as it takes the stage.
 * --------------------------------------------------------------------------
 */

interface ShowcaseHandlers {
    onActiveChange: (index: number) => void;
    onFirstScroll: () => void;
}

function animateShowcase(
    root: HTMLElement,
    reducedMotion: boolean,
    { onActiveChange, onFirstScroll }: ShowcaseHandlers,
) {
    const container = root.querySelector<HTMLElement>("[data-projects-rail]");
    const stage = root.querySelector<HTMLElement>("[data-showcase-stage]");
    if (!container || !stage) return;

    const cards = Array.from(
        stage.querySelectorAll<HTMLElement>("[data-project-index]"),
    );
    if (cards.length === 0) return;

    // One paused reveal timeline per card, mirroring the original per-project
    // choreography: media first, then copy staggering in.
    const reveals = cards.map((card) => {
        const media = card.querySelector<HTMLElement>("[data-pin-media]");
        const mediaImg = card.querySelector<HTMLElement>(
            "[data-parallax-media]",
        );
        const revealTargets = (
            [
                "inner",
                "kicker",
                "desc",
                "tags",
                "meta",
                "cta",
            ] as const
        )
            .map((name) =>
                card.querySelector<HTMLElement>(`[data-reveal-${name}]`),
            )
            .filter((el): el is HTMLElement => !!el);

        const tl = gsap.timeline({
            paused: true,
            defaults: { ease: "power2.out" },
        });
        if (media) tl.to(media, { autoAlpha: 1, duration: 0.35 }, 0);
        if (mediaImg) {
            tl.to(
                mediaImg,
                { scale: 1, y: 0, duration: 0.9, overwrite: "auto" },
                0,
            );
        }
        revealTargets.forEach((el, i) => {
            tl.to(el, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.1 + i * 0.06);
        });

        return { card, media, mediaImg, revealTargets, tl };
    });

    const show = (entry: (typeof reveals)[number]) => {
        gsap.set(entry.card, { autoAlpha: 1 });
        entry.tl.play();
    };

    const reset = (entry: (typeof reveals)[number]) => {
        entry.tl.pause(0);
        if (entry.media) gsap.set(entry.media, { autoAlpha: 0 });
        if (entry.mediaImg) gsap.set(entry.mediaImg, { scale: 1.04, y: 8 });
        gsap.set(entry.revealTargets, { autoAlpha: 0, y: 32 });
    };

    // Mobile / reduced motion: the CSS drops the stage, so the cards are a
    // plain vertical stack and only need their one-shot reveals.
    if (reducedMotion || !window.matchMedia("(min-width: 881px)").matches) {
        reveals.forEach((entry) => {
            if (reducedMotion) {
                gsap.set(
                    [
                        entry.media,
                        entry.mediaImg,
                        ...entry.revealTargets,
                    ].filter((el): el is HTMLElement => !!el),
                    { autoAlpha: 1, y: 0, scale: 1 },
                );
                return;
            }
            reset(entry);
            ScrollTrigger.create({
                id: `portfolio-card-${reveals.indexOf(entry)}`,
                trigger: entry.card,
                start: "top 85%",
                end: "bottom 20%",
                animation: entry.tl,
                toggleActions: "play none none reverse",
            });
        });
        onActiveChange(0);
        return;
    }

    // Desktop: every card starts hidden except the first, which is on stage
    // from the first paint so the showcase is never blank.
    reveals.forEach((entry, i) => {
        gsap.set(entry.card, { autoAlpha: i === 0 ? 1 : 0 });
        reset(entry);
    });
    show(reveals[0]);
    onActiveChange(0);

    const last = reveals.length - 1;
    let current = 0;
    let hinted = false;

    // A single project has no runway to scroll, so the card simply stays on
    // stage. Creating a zero-length trigger here would never fire onUpdate.
    if (last === 0) {
        onActiveChange(0);
        return;
    }

    const applyProgress = (progress: number) => {
        // 0 -> card 0, 1 -> card n. Cross-fade around the integer boundaries.
        const position = progress * last;
        reveals.forEach((entry, i) => {
            const distance = Math.abs(position - i);
            const alpha = distance >= 1 ? 0 : 1 - distance;
            gsap.set(entry.card, { autoAlpha: alpha });
        });

        const index = Math.max(0, Math.min(last, Math.round(position)));
        if (index !== current) {
            current = index;
            onActiveChange(index);
            show(reveals[index]);
        }

        if (!hinted && progress > 0.005) {
            hinted = true;
            onFirstScroll();
        }
    };

    ScrollTrigger.create({
        id: "portfolio-showcase",
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyProgress(self.progress),
    });
}

/* --------------------------------------------------------------------------
 * Hero / overview
 * -------------------------------------------------------------------------- */

function ShowcaseHero({
    projects,
    loading,
    heroMedia,
}: {
    projects: PortfolioProject[];
    loading: boolean;
    heroMedia: string;
}) {
    return (
        <section className={styles.hero} data-hero-root>
            <div className={styles.heroCopy} data-hero-copy>
                <p className={styles.kicker}>Selected work</p>
                <h1 data-hero-title>
                    Built for businesses that
                    <br />
                    mean it.
                </h1>
                <p className={styles.intro} data-hero-intro>
                    A look at the products, platforms, and digital presence
                    projects we have delivered for real clients.
                </p>
                {!loading && projects.length > 0 ? (
                    <p className={styles.heroCount} data-hero-count>
                        {projects.length}{" "}
                        <span>
                            {projects.length === 1 ? "project" : "projects"}
                        </span>
                    </p>
                ) : null}
            </div>

            <div className={styles.heroMedia} data-hero-media>
                {heroMedia ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        className={styles.heroMediaImg}
                        src={heroMedia}
                        alt={projects[0]?.title ?? "Selected work"}
                        loading="eager"
                    />
                ) : (
                    <div className={styles.mediaPlaceholder} aria-hidden="true">
                        Project imagery
                    </div>
                )}
            </div>
        </section>
    );
}

function ShowcaseProgress({
    activeIndex,
    total,
    category,
    loading,
    reducedMotion,
}: {
    activeIndex: number;
    total: number;
    category: string | undefined;
    loading: boolean;
    reducedMotion: boolean;
}) {
    if (loading || total === 0) return null;

    const current = Math.min(activeIndex, total - 1);
    const clamped = Math.max(current, 0);

    return (
        <div
            className={styles.progress}
            role="status"
            aria-live="polite"
            data-progress-rail
        >
            {category ? (
                <span className={styles.progressCategory}>{category}</span>
            ) : null}
            <div className={styles.progressTrack}>
                <div
                    className={styles.progressFill}
                    data-progress-fill
                    style={{
                        width: reducedMotion
                            ? `${((clamped + 1) / total) * 100}%`
                            : "0%",
                    }}
                    aria-hidden="true"
                />
            </div>
        </div>
    );
}

function ShowcaseLoading() {
    return (
        <div className={styles.empty}>
            <strong>Loading selected work</strong>
            <p>
                Pulling the latest projects from the portfolio. This usually
                takes only a moment.
            </p>
        </div>
    );
}

function ShowcaseEmpty() {
    return (
        <div className={styles.empty}>
            <strong>No case studies yet</strong>
            <p>
                The portfolio is still being prepared. When projects are
                published they will appear here as a visual case-study showcase.
            </p>
        </div>
    );
}

function ShowcaseContact() {
    return (
        <section className={styles.contact}>
            <p className={styles.kicker}>Make a move</p>
            <h2>
                Want work like this?
                <br />
                <em>Let&apos;s build it.</em>
            </h2>
            <a
                className={styles.primaryButton}
                href="mailto:hello@nexora.studio"
            >
                hello@nexora.studio <span aria-hidden="true">↗</span>
            </a>
        </section>
    );
}
