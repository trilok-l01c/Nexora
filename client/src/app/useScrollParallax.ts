"use client";

import { useEffect, useRef } from "react";

/**
 * Drives subtle scale + vertical drift on the showcase media as each pinned
 * project section scrolls through the centre of the viewport.
 *
 * It never touches layout — only `transform` (composited) — and writes two CSS
 * custom properties the stylesheet reads (`--nx-pscale` / `--nx-ptrans`).
 * Updates are RAF-throttled so the page stays jank-free even with several
 * full-bleed images.
 *
 * It is deliberately a no-op when:
 *  - the visitor prefers reduced motion (motion is disabled entirely), or
 *  - the viewport is below the desktop breakpoint (mobile uses a clean
 *    vertical stack with lightweight CSS reveals instead of forced sticky
 *    layouts).
 *
 * When JS is unavailable the variables are never written, so the media simply
 * rests at scale(1) — the page degrades to a normal scroll of images.
 */
export function useScrollParallax<T extends HTMLElement = HTMLElement>() {
    const containerRef = useRef<T>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        // No sticky parallax on mobile — the layout there is a plain vertical
        // stack, so we let the browser handle native momentum scrolling.
        if (!window.matchMedia("(min-width: 761px)").matches) return;

        const mediaEls = Array.from(
            container.querySelectorAll<HTMLElement>("[data-parallax-media]"),
        );
        if (mediaEls.length === 0) return;

        let ticking = false;

        const clamp = (value: number, min: number, max: number) =>
            Math.min(Math.max(value, min), max);

        function update() {
            const vh = window.innerHeight;
            for (const media of mediaEls) {
                const rect = media.getBoundingClientRect();
                const halfH = rect.height / 2;
                // Distance of the media's vertical centre from the viewport centre.
                const offset = rect.top + halfH - vh / 2;
                const range = vh / 2 + halfH;
                const centered =
                    range > 0 ? clamp(1 - Math.abs(offset) / range, 0, 1) : 1;

                // A whisper-scale that peaks when centred, plus a small vertical
                // drift that settles back to zero at the edges. Both are smooth
                // and compositor-friendly.
                const scale = 1 + 0.035 * centered;
                const translate = -22 * centered * (1 - centered);

                media.style.setProperty("--nx-pscale", scale.toFixed(4));
                media.style.setProperty("--nx-ptrans", `${translate.toFixed(2)}px`);
            }
            ticking = false;
        }

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        return () => {
            ticking = false;
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            mediaEls.forEach((media) => {
                media.style.removeProperty("--nx-pscale");
                media.style.removeProperty("--nx-ptrans");
            });
        };
    }, []);

    return containerRef;
}
