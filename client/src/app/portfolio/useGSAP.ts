"use client";

import { useEffect, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let _scrollTriggerRegistered = false;
let _motionQuery: MediaQueryList | null = null;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function motionQuery() {
    if (!_motionQuery) {
        _motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    }
    return _motionQuery;
}

function subscribeReducedMotion(onChange: () => void) {
    const query = motionQuery();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
    return motionQuery().matches;
}

function getReducedMotionServerSnapshot() {
    return false;
}

// `ready` is false during SSR and the hydration render, then true once the
// client store is subscribed — i.e. it is a hydration-safe "is this the
// browser?" flag that needs no effect and no extra render pass.
function subscribeNever() {
    return () => {};
}

function getClientSnapshot() {
    return true;
}

function getServerSnapshot() {
    return false;
}

/**
 * Client-safe GSAP setup for the portfolio showcase.
 *
 * - Registers ScrollTrigger exactly once across the app lifecycle.
 * - Exposes the user's reduced-motion preference, kept in sync if it changes.
 * - `ready` stays false until the browser is in charge, so nothing GSAP-owned
 *   runs during SSR/hydration (no hydration mismatches).
 */
export function useGSAP() {
    const ready = useSyncExternalStore(
        subscribeNever,
        getClientSnapshot,
        getServerSnapshot,
    );
    const reducedMotion = useSyncExternalStore(
        subscribeReducedMotion,
        getReducedMotionSnapshot,
        getReducedMotionServerSnapshot,
    );

    useEffect(() => {
        if (!_scrollTriggerRegistered) {
            gsap.registerPlugin(ScrollTrigger);
            _scrollTriggerRegistered = true;
        }
    }, []);

    return { ready, reducedMotion };
}
