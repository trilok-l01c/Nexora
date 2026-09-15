"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useClientAuth } from "./ClientAuthContext";
import { useDrawerGestures } from "../useDrawerGestures";
import styles from "./portal.module.css";

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
    const { logout } = useClientAuth();
    const [drawer, setDrawer] = useState({ open: false, visible: false });
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const drawerRef = useRef<HTMLDivElement>(null);
    const isLoginPage = pathname === "/client/login";
    const drawerOpen = drawer.open;
    const drawerVisible = drawer.visible;

    function openDrawer() {
        setDrawer({ visible: true, open: false });
        requestAnimationFrame(() => {
            requestAnimationFrame(() =>
                setDrawer({ visible: true, open: true }),
            );
        });
    }

    function closeDrawer() {
        setDrawer((current) => ({ ...current, open: false }));
        window.setTimeout(
            () => setDrawer((current) => ({ ...current, visible: false })),
            280,
        );
    }

    // Swipe right from the left screen edge opens the drawer; a leftward
    // swipe on the open drawer closes it. Handlers attach to the drawer root
    // below; the open swipe is watched at the document level by the hook.
    const drawerGestures = useDrawerGestures({
        isOpen: drawerOpen,
        onOpen: openDrawer,
        onClose: closeDrawer,
    });

    useEffect(() => {
        if (!drawerVisible) return;
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") closeDrawer();
        }
        document.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const menuButton = menuButtonRef.current;
        const timer = window.setTimeout(() => {
            drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus();
        }, 60);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            window.clearTimeout(timer);
            menuButton?.focus();
        };
    }, [drawerVisible]);

    async function handleLogout() {
        closeDrawer();
        await logout();
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
                {!isLoginPage && (
                    <aside className={styles.sidebar}>
                        <div className={styles.brand}>
                            <span className={styles.brandMark}>N</span> Nexora
                        </div>
                        <nav className={styles.nav} aria-label="Client sections">
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
                        </nav>
                        <button
                            type="button"
                            className={styles.logout}
                            onClick={handleLogout}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Log out
                        </button>
                    </aside>
                )}

                {!isLoginPage && (
                    <header className={styles.mobileHeader}>
                        <div className={styles.brand}>
                            <span className={styles.brandMark}>N</span> Nexora
                        </div>
                        <button
                            ref={menuButtonRef}
                            type="button"
                            className={styles.mobileMenuButton}
                            onClick={openDrawer}
                            aria-expanded={drawerVisible}
                            aria-controls="client-drawer"
                            aria-label="Open navigation menu"
                        >
                            <span aria-hidden="true">☰</span>
                        </button>
                    </header>
                )}

                {/* Mobile drawer */}
                {!isLoginPage && drawerVisible && (
                    <div className={styles.drawerRoot} {...drawerGestures}>
                        <div
                            className={`${styles.drawerBackdrop} ${drawerOpen ? styles.drawerBackdropOpen : ""}`}
                            onClick={closeDrawer}
                            aria-hidden="true"
                        />
                        <div
                            ref={drawerRef}
                            id="client-drawer"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Client navigation"
                            className={`${styles.drawerPanel} ${drawerOpen ? styles.drawerPanelOpen : ""}`}
                        >
                            <div className={styles.drawerHeader}>
                                <span className={styles.brand}>
                                    <span className={styles.brandMark}>N</span>
                                    Nexora
                                </span>
                                <button
                                    type="button"
                                    className={styles.drawerClose}
                                    onClick={closeDrawer}
                                    aria-label="Close navigation menu"
                                >
                                    <span aria-hidden="true">✕</span>
                                </button>
                            </div>
                            <nav className={styles.drawerNav} aria-label="Client sections mobile">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={closeDrawer}
                                        className={
                                            isActive(item.href) ? styles.active : ""
                                        }
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                            <div className={styles.drawerFooter}>
                                <button
                                    type="button"
                                    className={`${styles.logout} ${styles.drawerLogout}`}
                                    onClick={handleLogout}
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Log out
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <main className={styles.main}>{children}</main>
            </div>
        </div>
    );
}
