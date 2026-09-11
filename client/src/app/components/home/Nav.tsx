"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { serviceGroups } from "../../services";
import styles from "./Nav.module.css";

export default function Nav() {
    const [openMenu, setOpenMenu] = useState<"services" | "solutions" | null>(
        null,
    );
    const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    function cancelClose() {
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }
    }

    function openMenuWithDelay(menu: "services" | "solutions") {
        cancelClose();
        setOpenMenu(menu);
    }

    function scheduleClose() {
        cancelClose();
        closeTimeout.current = setTimeout(() => {
            setOpenMenu(null);
            closeTimeout.current = null;
        }, 800);
    }

    return (
        <nav className={styles.nav} aria-label="Main navigation">
            <Link className={styles.brand} href="/" aria-label="Nexora home">
                <span className={styles.brandMark} aria-hidden="true">
                    N
                </span>
                <span>Nexora</span>
            </Link>
            <div className={styles.navLinks}>
                <div className={styles.navDropdown}>
                    <div
                        onMouseEnter={() => openMenuWithDelay("services")}
                        onMouseLeave={scheduleClose}
                    >
                        <button
                            className={styles.navTrigger}
                            type="button"
                            aria-expanded={openMenu === "services"}
                            aria-controls="services-menu"
                            onClick={() =>
                                setOpenMenu(
                                    openMenu === "services" ? null : "services",
                                )
                            }
                        >
                            Services <span aria-hidden="true">⌄</span>
                        </button>
                        {openMenu === "services" && (
                            <div
                                className={styles.dropdownMenu}
                                id="services-menu"
                            >
                                {serviceGroups.services.map((item) => (
                                    <Link
                                        href={`/services/${item.slug}`}
                                        key={item.slug}
                                    >
                                        <span>{item.title}</span>
                                        <small>{item.shortDescription}</small>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.navDropdown}>
                    <div
                        onMouseEnter={() => openMenuWithDelay("solutions")}
                        onMouseLeave={scheduleClose}
                    >
                        <button
                            className={styles.navTrigger}
                            type="button"
                            aria-expanded={openMenu === "solutions"}
                            aria-controls="solutions-menu"
                            onClick={() =>
                                setOpenMenu(
                                    openMenu === "solutions"
                                        ? null
                                        : "solutions",
                                )
                            }
                        >
                            Solutions <span aria-hidden="true">⌄</span>
                        </button>
                        {openMenu === "solutions" && (
                            <div
                                className={styles.dropdownMenu}
                                id="solutions-menu"
                            >
                                {serviceGroups.solutions.map((item) => (
                                    <Link
                                        href={`/services/${item.slug}`}
                                        key={item.slug}
                                    >
                                        <span>{item.title}</span>
                                        <small>{item.shortDescription}</small>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <Link href="/#approach">Approach</Link>
                <Link href="/clients">Clients</Link>
                <Link href="/alliances">Alliances</Link>
            </div>
            <Link className={styles.navCta} href="/#contact">
                Start a project <span aria-hidden="true">↗</span>
            </Link>
        </nav>
    );
}
