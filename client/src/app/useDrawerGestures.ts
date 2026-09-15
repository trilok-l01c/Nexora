"use client";

// Lightweight touch-gesture support for the mobile side drawers, built on
// plain browser touch events — no gesture library.
//
// - Swipe right from the left screen edge (closed drawer) opens it.
// - Swipe left on the open drawer or its backdrop closes it.
//
// A swipe only counts when the horizontal distance passes a generous
// threshold AND exceeds the vertical distance, so normal vertical scrolling
// is never hijacked and tiny accidental movements never trigger anything.
// Listeners are passive: we only observe geometry, we never preventDefault.

import {
    useEffect,
    useRef,
    type TouchEvent as ReactTouchEvent,
} from "react";

const EDGE_ZONE_PX = 28; // only swipes starting this close to the left edge can open
const OPEN_THRESHOLD_PX = 56; // horizontal distance required to open
const CLOSE_THRESHOLD_PX = 64; // horizontal distance required to close

type TouchPoint = { x: number; y: number };

type DrawerGestureHandlers = {
    onTouchStart: (event: ReactTouchEvent) => void;
    onTouchMove: (event: ReactTouchEvent) => void;
    onTouchEnd: () => void;
    onTouchCancel: () => void;
};

export function useDrawerGestures(options: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}): DrawerGestureHandlers {
    const { isOpen, onOpen, onClose } = options;
    const start = useRef<TouchPoint | null>(null);
    // Latest callbacks/isOpen for the once-registered document listeners.
    // Written in an effect (not during render) to keep refs out of render.
    const latest = useRef({ isOpen, onOpen, onClose });
    useEffect(() => {
        latest.current = { isOpen, onOpen, onClose };
    });

    // Opening gesture: watched at the document level while the drawer is
    // closed. Only touches starting within the left edge zone participate.
    useEffect(() => {
        function handleTouchStart(event: TouchEvent) {
            if (latest.current.isOpen || event.touches.length !== 1) return;
            const touch = event.touches[0];
            if (touch.clientX > EDGE_ZONE_PX) return;
            start.current = { x: touch.clientX, y: touch.clientY };
        }
        function handleTouchMove(event: TouchEvent) {
            const origin = start.current;
            if (!origin || latest.current.isOpen || event.touches.length !== 1) {
                return;
            }
            const touch = event.touches[0];
            const dx = touch.clientX - origin.x;
            const dy = touch.clientY - origin.y;
            if (dx > OPEN_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy)) {
                start.current = null;
                latest.current.onOpen();
            }
        }
        function handleTouchEnd() {
            start.current = null;
        }
        document.addEventListener("touchstart", handleTouchStart, {
            passive: true,
        });
        document.addEventListener("touchmove", handleTouchMove, {
            passive: true,
        });
        document.addEventListener("touchend", handleTouchEnd, {
            passive: true,
        });
        document.addEventListener("touchcancel", handleTouchEnd, {
            passive: true,
        });
        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
            document.removeEventListener("touchcancel", handleTouchEnd);
        };
    }, []);

    // Closing gesture: attached to the open drawer (or its backdrop, which
    // contains it). A leftward swipe beyond the threshold closes the drawer.
    // These handlers are re-created every render, so they can read the
    // current props directly.
    function handleTouchStart(event: ReactTouchEvent) {
        if (!isOpen || event.touches.length !== 1) return;
        const touch = event.touches[0];
        start.current = { x: touch.clientX, y: touch.clientY };
    }

    function handleTouchMove(event: ReactTouchEvent) {
        const origin = start.current;
        if (!origin) return;
        const touch = event.touches[0];
        const dx = touch.clientX - origin.x;
        const dy = touch.clientY - origin.y;
        if (dx < -CLOSE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy)) {
            start.current = null;
            onClose();
        }
    }

    function handleTouchEnd() {
        start.current = null;
    }

    return {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchEnd,
    };
}