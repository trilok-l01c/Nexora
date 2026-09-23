"use client";

import Link from "next/link";
import { useReveal } from "../../useReveal";
import styles from "./Footer.module.css";

export default function Footer() {
    const reveal = useReveal<HTMLElement>({ variant: "fade" });

    return (
        <footer className={styles.footer} id="about" {...reveal}>
            <Link className={styles.brand} href="#top">
                <span className={styles.brandMark} aria-hidden="true">
                    N
                </span>
                <span>Nexora</span>
            </Link>
            <span>Digital solutions for growing businesses</span>
            <span>© 2026 Nexora</span>
        </footer>
    );
}
