"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./HeroSlider.module.css";

type HeroSlide = {
    image: string;
    alt: string;
    phrase: string;
};

type HeroSliderProps = {
    slides: HeroSlide[];
};

const TYPING_SPEED = 60;
const ERASING_SPEED = 40;
const PAUSE_AFTER_TYPE = 2500;
const PAUSE_BEFORE_NEXT = 800;
const TRANSITION_DURATION = 600;

/**
 * A single, strictly-sequential state machine drives the typing effect:
 * type -> hold -> erase -> pause -> advance.
 *
 * Root-cause fixes:
 *  - `schedule()` cancels any pending timer before arming a new one, so EXACTLY
 *    ONE timer is ever active. Phases can never overlap/race. (Bug 2)
 *  - Mutable state lives in refs, so callbacks read fresh values, not a stale
 *    closure on the render-time `current` state. (stale-`current` drift /
 *    mixed fragments of two phrases)
 *  - The next slide index is read from `slideIdxRef` inside the callback.
 *  - Every phrase is confirmed to exist (`slide?.phrase ?? ""`) before use.
 *    (Bug 1: no literal "undefined")
 *  - The effect re-arms `loopActiveRef` on (re)mount so StrictMode's
 *    mount->cleanup->mount cycle restarts cleanly.
 *  - Cursor blink is pure CSS; no second JS timer.
 */
export default function HeroSlider({ slides }: HeroSliderProps) {
    const [current, setCurrent] = useState(0);
    const [prevSlide, setPrevSlide] = useState<HeroSlide | null>(null);
    const [displayText, setDisplayText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Mutable state read by the scheduled callbacks (refs = no stale closure).
    const slidesRef = useRef(slides);
    const slideIdxRef = useRef(0);
    const phraseRef = useRef("");
    const textRef = useRef("");
    const charIdxRef = useRef(0);
    const phaseRef = useRef<"type" | "hold" | "erase" | "pause" | "transition">(
        "type",
    );
    const loopActiveRef = useRef(true);
    // A single timer is all the machine ever needs.
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Keep the slides ref in sync with the world.
    useEffect(() => {
        slidesRef.current = slides;
    }, [slides]);

    const clearTimer = () => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    // Arming a new timer cancels the previous one -> only one timer ever active.
    const schedule = (fn: () => void, delay: number) => {
        clearTimer();
        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            if (loopActiveRef.current) {
                fn();
            }
        }, delay);
    };

    useEffect(() => {
        // The effect may be torn down and re-run (StrictMode mount cycle).
        slidesRef.current = slides;
        slideIdxRef.current = current;
        loopActiveRef.current = true;

        const nextSlide = (idx: number) => slidesRef.current[idx];

        const startType = (slide: HeroSlide | undefined) => {
            if (!loopActiveRef.current) return;
            // Confirm the phrase exists before using it (Bug 1: no "undefined").
            const phrase = slide?.phrase ?? "";
            phraseRef.current = phrase;
            charIdxRef.current = 0;
            textRef.current = "";
            setDisplayText("");

            if (!phrase) {
                // No phrase to type: skip straight to advancing the slide.
                phaseRef.current = "transition";
                advanceToNext();
                return;
            }

            phaseRef.current = "type";
            setIsTyping(true);
            schedule(typeStep, 50);
        };

        const typeStep = () => {
            if (!loopActiveRef.current) return;
            const len = phraseRef.current.length;
            if (charIdxRef.current < len) {
                charIdxRef.current += 1;
                textRef.current = phraseRef.current.slice(
                    0,
                    charIdxRef.current,
                );
                setDisplayText(textRef.current);
                schedule(typeStep, TYPING_SPEED);
            } else {
                // Fully typed -> hold, then erase.
                setIsTyping(false);
                phaseRef.current = "hold";
                schedule(holdStep, PAUSE_AFTER_TYPE);
            }
        };

        const holdStep = () => {
            if (!loopActiveRef.current) return;
            phaseRef.current = "erase";
            setIsTyping(true);
            schedule(eraseStep, 50);
        };

        const eraseStep = () => {
            if (!loopActiveRef.current) return;
            const text = textRef.current;
            if (text.length > 0) {
                const next = text.slice(0, -1);
                textRef.current = next;
                setDisplayText(next);
                schedule(eraseStep, ERASING_SPEED);
            } else {
                // Fully erased -> short pause -> advance.
                setIsTyping(false);
                phaseRef.current = "pause";
                schedule(advanceToNext, PAUSE_BEFORE_NEXT);
            }
        };

        const advanceToNext = () => {
            if (!loopActiveRef.current) return;
            const list = slidesRef.current;
            if (list.length === 0) return;

            if (list.length === 1) {
                // Single slide: just re-type after the short pause.
                schedule(() => startType(nextSlide(0)), PAUSE_BEFORE_NEXT);
                return;
            }

            const idx = slideIdxRef.current;
            const nextIdx = (idx + 1) % list.length;
            slideIdxRef.current = nextIdx;

            setPrevSlide(nextSlide(idx));
            setCurrent(nextIdx);
            phaseRef.current = "transition";

            schedule(() => {
                if (!loopActiveRef.current) return;
                setPrevSlide(null);
                // Read the index from the ref (never a stale `current`).
                startType(nextSlide(slideIdxRef.current));
            }, TRANSITION_DURATION);
        };

        // Start the machine.
        startType(nextSlide(slideIdxRef.current));

        return () => {
            loopActiveRef.current = false;
            clearTimer();
        };
        // The typing machine is driven entirely by refs + `schedule`; `current` and
        // `schedule` are intentionally excluded from deps (including them would
        // tear down and restart the single-timer loop on every render).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slides]); // `slides` is the stable module-level `heroSlides` constant.

    const slide = slides[current] ?? slides[0];
    const safePhrase = displayText || "";
    return (
        <section className={styles.hero} id="top">
            <div className={styles.heroText}>
                <p className={styles.eyebrow}>
                    <span className={styles.eyebrowDot} /> Digital growth for
                    real businesses
                </p>
                <h1>
                    Business grows with technology
                    <br />
                    <em className={styles.dynamicPhrase}>
                        Make {safePhrase}
                        <span
                            className={`${styles.cursor} ${isTyping ? styles.blinkOn : styles.blinkOff}`}
                        >
                            |
                        </span>
                    </em>
                </h1>
                <p className={styles.heroSupport}>
                    Nexora helps local and growing businesses show up
                    professionally, serve customers better, and spend less time
                    fighting with technology. Powered by deep understanding of
                    Indian markets and real user needs.
                </p>
                <div className={styles.heroActions}>
                    <a href="#contact" className={styles.buttonPrimary}>
                        Start a conversation <span aria-hidden="true">↗</span>
                    </a>
                    <a href="#solutions" className={styles.buttonQuiet}>
                        Explore solutions <span aria-hidden="true">↓</span>
                    </a>
                </div>
            </div>
            <div className={styles.heroImageContainer}>
                {prevSlide && (
                    <img
                        src={prevSlide.image}
                        alt={prevSlide.alt}
                        className={`${styles.heroImage} ${styles.prev}`}
                    />
                )}
                <img
                    key={current}
                    src={slide?.image || ""}
                    alt={slide?.alt || ""}
                    className={styles.heroImage}
                />
            </div>
        </section>
    );
}
