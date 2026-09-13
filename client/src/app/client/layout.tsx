"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
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

    // Close mobile menu on route change.
    useEffect(() => {
        setMenuOpen(false);
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

    return (
        <div className={styles.portal}>
            <div className={styles.shell}>
                {/* Desktop sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.brand}>
                        <span className={styles.brandMark}>N</span> Nexora
                    </div>
                    <nav className={styles.nav} aria-label="Client sections">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className={
                                    isActive(item.href) ? styles.active : ""
                                }
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                    <button
                        className={styles.logout}
                        onClick={handleLogout}
                    >
                        Log out
                    </button>
                </aside>

                {/* Mobile header */}
                <header className={styles.mobileHeader}>
                    <div className={styles.brand}>
                        <span className={styles.brandMark}>N</span> Nexora
                    </div>
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

                {/* Mobile nav overlay */}
                {menuOpen && (
                    <nav
                        className={styles.mobileNav}
                        aria-label="Client sections mobile"
                    >
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className={
                                    isActive(item.href) ? styles.active : ""
                                }
                            >
                                {item.label}
                            </a>
                        ))}
                        <button
                            className={styles.logout}
                            onClick={handleLogout}
                        >
                            Log out
                        </button>
                    </nav>
                )}

                <main className={styles.main}>{children}</main>
            </div>
        </div>
    );
}
