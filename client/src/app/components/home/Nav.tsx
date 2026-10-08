"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useClientAuth } from "../../client/ClientAuthContext";
import { useTheme } from "../../ThemeProvider";
import styles from "./Nav.module.css";

const links = [
    { label: "Who we are", href: "/who-we-are" },
    { label: "What we do", href: "/what-we-do" },
    { label: "Our work", href: "/portfolio" },
];

export default function Nav() {
    const pathname = usePathname();
    const router = useRouter();
    const { status, user, logout } = useClientAuth();
    const { theme, toggleTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const isClient = status === "authenticated" && user?.role === "client";
    const isSignedIn = status === "authenticated";

    async function handleLogout() {
        await logout();
        router.push("/");
    }

    return (
        <header className={styles.shell}>
            <nav className={styles.nav} aria-label="Main navigation">
                <Link
                    href="/"
                    className={styles.brand}
                    onClick={() => setOpen(false)}
                >
                    <span className={styles.brandMark}>N</span>
                    <span>Nexora</span>
                </Link>
                <div className={styles.links}>
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={
                                pathname.startsWith(link.href)
                                    ? styles.active
                                    : undefined
                            }
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
                <div className={styles.actions}>
                    <button
                        className={styles.themeToggle}
                        type="button"
                        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                        aria-pressed={theme === "dark"}
                        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                        onClick={toggleTheme}
                    >
                        <span className={styles.themeIcon} aria-hidden="true">
                            {theme === "light" ? (
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8Z" />
                                </svg>
                            ) : (
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                >
                                    <circle cx="12" cy="12" r="4" />
                                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                                </svg>
                            )}
                        </span>
                    </button>
                    {isClient ? (
                        <Link
                            className={styles.portal}
                            href="/client/dashboard"
                        >
                            Client portal
                        </Link>
                    ) : !isSignedIn ? (
                        <Link className={styles.signIn} href="/client/login">
                            Sign in
                        </Link>
                    ) : null}
                    {isSignedIn && (
                        <button
                            className={styles.signOut}
                            onClick={handleLogout}
                        >
                            Sign out
                        </button>
                    )}
                    <Link className={styles.cta} href="/#contact">
                        Let&apos;s talk <span>→</span>
                    </Link>
                    <button
                        className={styles.menu}
                        type="button"
                        aria-label="Toggle menu"
                        aria-expanded={open}
                        onClick={() => setOpen(!open)}
                    >
                        <span />
                        <span />
                    </button>
                </div>
            </nav>
            {open && (
                <div className={styles.mobile} data-motion="drawer">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {!isSignedIn && (
                        <Link
                            href="/client/login"
                            onClick={() => setOpen(false)}
                        >
                            Sign in
                        </Link>
                    )}
                    <Link href="/#contact" onClick={() => setOpen(false)}>
                        Let&apos;s talk
                    </Link>
                </div>
            )}
        </header>
    );
}
