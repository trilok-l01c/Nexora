"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { serviceGroups } from "../../services";
import { useTheme } from "../../ThemeProvider";
import AuthDialog from "../auth/AuthDialog";
import styles from "./Nav.module.css";

export default function Nav() {
    const { theme, toggleTheme } = useTheme();
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
                <Link href="/portfolio">Portfolio</Link>
                <Link href="/clients">Clients</Link>
                <Link href="/alliances">Alliances</Link>
            </div>
            <div className={styles.navActions}>
                <button
                    className={styles.themeToggle}
                    type="button"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                    title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                >
                    {theme === "light" ? (
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    ) : (
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    )}
                </button>
                <AuthDialog />
            </div>
        </nav>
    );
}
