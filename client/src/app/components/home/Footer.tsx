"use client";

import Link from "next/link";
import { useReveal } from "../../useReveal";
import styles from "./Footer.module.css";

export default function Footer() {
    const reveal = useReveal<HTMLElement>({ variant: "fade" });

    return (
        <footer className={styles.footer} id="about" {...reveal}>
            <Link className={styles.brand} href="#top">
                <img
                    className={styles.brandMark}
                    src="/ravaite-logo-transparent.svg"
                    alt=""
                />
                <span>Ravaite</span>
            </Link>
            <span>Digital solutions for growing businesses</span>
            <span>© 2026 Ravaite</span>
        </footer>
    );
}
