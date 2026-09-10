"use client";

import Link from "next/link";
import { useState } from "react";
import { serviceGroups } from "../../services";
import styles from "./Nav.module.css";

export default function Nav() {
    const [openMenu, setOpenMenu] = useState<"services" | "solutions" | null>(
        null,
    );

    return (
        <nav className={styles.nav} aria-label="Main navigation">
            <Link className={styles.brand} href="#top" aria-label="Nexora home">
                <span className={styles.brandMark} aria-hidden="true">
                    N
                </span>
                <span>Nexora</span>
            </Link>
            <div className={styles.navLinks}>
                <div className={styles.navDropdown}>
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
                        <div className={styles.dropdownMenu} id="services-menu">
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
                <div className={styles.navDropdown}>
                    <button
                        className={styles.navTrigger}
                        type="button"
                        aria-expanded={openMenu === "solutions"}
                        aria-controls="solutions-menu"
                        onClick={() =>
                            setOpenMenu(
                                openMenu === "solutions" ? null : "solutions",
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
                <a href="#approach">Approach</a>
                <Link href="/clients">Clients</Link>
                <Link href="/alliances">Alliances</Link>
            </div>
            <a className={styles.navCta} href="#contact">
                Start a project <span aria-hidden="true">↗</span>
            </a>
        </nav>
    );
}
