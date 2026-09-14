"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./portal.module.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";

type NavItem = {
    label: string;
    href: string;
};

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/client/dashboard" },
    { label: "Projects", href: "/client/projects" },
    { label: "Support", href: "/client/support" },
    { label: "Account", href: "/client/account" },
];

// The portal design tokens (light values on `.portal`, dark values on
// `html[data-theme="dark"] .portal`) are scoped to the `.portal` class, so
// every /client route must render inside it. Without this wrapper the login
// page's labels and inputs resolve no variables and fall back to unstyled
// native form controls that ignore dark mode.
export default function ClientLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const previousPathname = useRef(pathname);
    const isLoginPage = pathname === "/client/login";

    // Close mobile menu on route change.
    useEffect(() => {
        if (previousPathname.current !== pathname) {
            previousPathname.current = pathname;
            setMenuOpen(false);
        }
    }, [pathname]);

    async function handleLogout() {
        await fetch(`${apiUrl}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
        }).catch(() => undefined);
        router.replace("/client/login");
    }

    function isActive(href: string) {
        if (href === "/client/dashboard") {
            return pathname === "/client/dashboard";
        }
        return pathname.startsWith(href);
    }

    // The main site Nav is fixed (height 88px / 72px mobile) and the global
    // stylesheet offsets it with body { padding-top }. On /client routes that
    // Nav is not rendered (ConditionalNav returns null), so the leftover top
    // padding would push the client navbar down. Zero it while mounted and
    // restore it when leaving the client portal.
    useEffect(() => {
        const previous = document.body.style.paddingTop;
        document.body.style.paddingTop = "0px";
        return () => {
            document.body.style.paddingTop = previous;
        };
    }, []);

    // The sign-in page has its own centered card; it does not need the navbar.
    if (isLoginPage) {
        return <div className={styles.portal}>{children}</div>;
    }

    return (
        <div className={styles.portal}>
            {/* Top navbar (hidden on the sign-in page) */}
            <header className={styles.navbar}>
                <Link
                    href="/client/dashboard"
                    className={styles.brand}
                    aria-label="Nexora client dashboard"
                >
                    <span className={styles.brandMark}>N</span> Nexora
                </Link>
                <nav
                    className={
                        menuOpen
                            ? `${styles.navLinks} ${styles.navLinksOpen}`
                            : styles.navLinks
                    }
                    aria-label="Client sections"
                >
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                isActive(item.href) ? styles.active : ""
                            }
                        >
                            {item.label}
                        </Link>
                    ))}
                    <button
                        className={styles.logout}
                        onClick={handleLogout}
                    >
                        Log out
                    </button>
                </nav>
                <button
                    type="button"
                    className={styles.mobileMenuButton}
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-expanded={menuOpen}
                    aria-label="Toggle navigation menu"
                >
                    {menuOpen ? "✕" : "☰"}
                </button>
            </header>

            <main className={styles.main}>{children}</main>
        </div>
    );
}
