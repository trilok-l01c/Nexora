"use client";

// Scroll-reveal support for the site's entrance animations, built on a plain
// IntersectionObserver — no animation library.
//
// The hook is applied to the element that should animate rather than wrapping
// it in an extra div, so grid/flex layouts and :nth-child styling keep working
// exactly as before. It returns props to spread onto that element:
//
//     const reveal = useReveal<HTMLDivElement>();
//     <div {...reveal}>…</div>
//
// Elements render as data-reveal="pending" (hidden, per globals.css) and flip
// to "in" when they scroll into view, which starts the keyframe. A
// reduced-motion preference skips the observer and shows content immediately,
// and layout.tsx adds a <noscript> override so the hidden state is never
// applied when JS is unavailable.

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * React's CSSProperties has no index signature for custom properties, so the
 * stagger variable is typed explicitly instead of being cast away.
 */
type RevealStyle = CSSProperties & Record<`--${string}`, string>;

export type RevealVariant =
    | "up"
    | "down"
    | "left"
    | "right"
    | "fade"
    | "scale";

type RevealOptions = {
    /** Direction the element travels from. Defaults to "up". */
    variant?: RevealVariant;
    /** Stagger offset in milliseconds. */
    delay?: number;
    /** Fraction of the element that must be visible to trigger. */
    threshold?: number;
    /** Re-animate on every re-entry instead of once. */
    repeat?: boolean;
};

export function useReveal<T extends HTMLElement = HTMLElement>(
    {
        variant = "up",
        delay = 0,
        threshold = 0.15,
        repeat = false,
    }: RevealOptions = {},
) {
    const ref = useRef<T>(null);

    // The element is rendered as data-reveal="pending" (hidden) by globals.css
    // and flips to "in" when it scrolls into view. We drive the attribute
    // directly on the DOM node inside the effect instead of syncing through
    // React state: the observer callback is the external system, and mutating
    // the DOM there is exactly what effects are for — no intermediate state
    // and no triggering re-renders per element.
    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        // Users who asked for reduced motion get the content straight away
        // rather than being stuck in the hidden state.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            node.setAttribute("data-reveal", "in");
        }

        // Browsers without IntersectionObserver also need the reveal guard
        // cleared (no observer will ever reach the callback below).
        if (typeof IntersectionObserver === "undefined") {
            node.setAttribute("data-reveal", "in");
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        node.setAttribute("data-reveal", "in");
                        if (!repeat) observer.unobserve(entry.target);
                    } else if (repeat) {
                        node.setAttribute("data-reveal", "pending");
                    }
                }
            },
            // The negative bottom margin holds the trigger back until the
            // element is meaningfully on screen instead of barely peeking in.
            { threshold, rootMargin: "0px 0px -60px 0px" },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [repeat, threshold]);

    return {
        ref,
        "data-reveal-variant": variant,
        style: delay
            ? ({ "--nx-delay": `${delay}ms` } as RevealStyle)
            : undefined,
    };
}
