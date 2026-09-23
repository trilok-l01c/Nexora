"use client";

import { type ReactNode } from "react";
import { useReveal, type RevealVariant } from "../../useReveal";

type RevealProps = {
    children: ReactNode;
    className?: string;
    delay?: number;
    variant?: RevealVariant;
};

/** A small, SSR-safe wrapper for the shared IntersectionObserver reveal system. */
export default function Reveal({
    children,
    className,
    delay,
    variant = "up",
}: RevealProps) {
    const reveal = useReveal<HTMLDivElement>({ delay, variant });
    return <div className={className} {...reveal}>{children}</div>;
}
