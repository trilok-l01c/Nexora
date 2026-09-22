"use client";

import { useEffect, useRef, useState } from "react";

function isTouchDevice() {
    return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(hover: none)").matches
    );
}

export function useCardTilt() {
    const ref = useRef<HTMLAnchorElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const card = ref.current;
        if (!card || isTouchDevice()) return;

        const maxTilt = 8;

        const handleMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const rotateX = ((e.clientY - centerY) / rect.height) * maxTilt;
            const rotateY = -((e.clientX - centerX) / rect.width) * maxTilt;

            setPos({ x: rotateY, y: rotateX });
        };

        const handleLeave = () => {
            setPos({ x: 0, y: 0 });
        };

        card.style.transition = "transform 0.1s ease-out";
        card.addEventListener("mousemove", handleMove);
        card.addEventListener("mouseleave", handleLeave);

        return () => {
            card.removeEventListener("mousemove", handleMove);
            card.removeEventListener("mouseleave", handleLeave);
            card.style.transform = "none";
        };
    }, []);

    return { ref, pos };
}