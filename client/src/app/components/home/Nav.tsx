"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { serviceGroups } from "../../services";
import { useTheme } from "../../ThemeProvider";
import { useClientAuth } from "../../client/ClientAuthContext";
import { useDrawerGestures } from "../../useDrawerGestures";
import AuthDialog from "../auth/AuthDialog";
import styles from "./Nav.module.css";

const publicLinks = [
    { label: "Approach", href: "/approach" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Clients", href: "/clients" },
    { label: "Alliances", href: "/alliances" },
];

export default function Nav() {
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const { status, user, logout } = useClientAuth();
    const [openMenu, setOpenMenu] = useState<"services" | "solutions" | null>(
        null,
    );
    const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    // Mobile-only accordion state, kept separate from the desktop `openMenu`
    // state so a dropdown left open on a wider viewport can never leak into
    // (or out of) the drawer.
    const [drawerSection, setDrawerSection] = useState<
        "services" | "solutions" | null
    >(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const drawerRef = useRef<HTMLDivElement>(null);

    const isClient = status === "authenticated" && user?.role === "client";
    // Matches the `role` enum in server/models/User.js — anything else must not
    // render client navigation.
    const isAdmin =
        status === "authenticated" &&
        (user?.role === "admin" || user?.role === "staff");

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

    function closeDropdown() {
        cancelClose();
        setOpenMenu(null);
    }

    function openDrawer() {
        setDrawerSection(null);
        setDrawerVisible(true);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setDrawerOpen(true));
        });
    }

    function closeDrawer() {
        setDrawerOpen(false);
        window.setTimeout(() => setDrawerVisible(false), 280);
    }

    // Swipe left from the right screen edge opens the drawer; a rightward
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

    useEffect(() => {
        if (!openMenu) return;
        function handlePointerDown(event: PointerEvent) {
            const target = event.target as HTMLElement;
            if (!target.closest("[data-nav-dropdown]")) closeDropdown();
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") closeDropdown();
        }
        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- closeDropdown is stable enough; adding it would re-bind on every render
    }, [openMenu]);

    async function handleLogout() {
        closeDrawer();
        await logout();
        router.push("/");
    }

    // Marks the drawer entry for the page the visitor is actually on. Hash links
    // (e.g. `/#approach`) are never marked, since they are not separate pages.
    function isCurrentPath(href: string) {
        if (href.includes("#")) return false;
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    }

    function drawerLinkClass(href: string) {
        const classes: string[] = [];
        if (isClient || isAdmin) classes.push(styles.drawerSecondary);
        if (isCurrentPath(href)) classes.push(styles.drawerActive);
        return classes.join(" ") || undefined;
    }

    // Services and Solutions have no index route — they are groups of
    // `/services/<slug>` pages — so on mobile they render as accessible
    // accordions instead of links that would 404.
    function renderDrawerGroup(
        group: "services" | "solutions",
        label: string,
    ) {
        const isOpen = drawerSection === group;
        const menuId = `drawer-${group}-menu`;
        return (
            <div className={styles.drawerGroup} key={group}>
                <button
                    type="button"
                    className={styles.drawerGroupTrigger}
                    aria-expanded={isOpen}
                    aria-controls={menuId}
                    onClick={() => setDrawerSection(isOpen ? null : group)}
                >
                    {label}
                    <span
                        className={`${styles.drawerChevron} ${isOpen ? styles.drawerChevronOpen : ""}`}
                        aria-hidden="true"
                    >
                        ⌄
                    </span>
                </button>
                {isOpen && (
                    <div className={styles.drawerGroupMenu} id={menuId}>
                        {serviceGroups[group].map((item) => (
                            <Link
                                key={item.slug}
                                href={`/services/${item.slug}`}
                                onClick={closeDrawer}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <nav className={styles.nav} aria-label="Main navigation">
                <Link className={styles.brand} href="/" aria-label="Nexora home">
                    <span className={styles.brandMark} aria-hidden="true">
                        N
                    </span>
                    <span>Nexora</span>
                </Link>
                <div className={styles.navLinks}>
                    <div className={styles.navDropdown} data-nav-dropdown>
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
                                            onClick={closeDropdown}
                                        >
                                            <span>{item.title}</span>
                                            <small>{item.shortDescription}</small>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.navDropdown} data-nav-dropdown>
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
                                            onClick={closeDropdown}
                                        >
                                            <span>{item.title}</span>
                                            <small>{item.shortDescription}</small>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {publicLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                            {link.label}
                        </Link>
                    ))}
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
                    <span className={styles.desktopAuth}>
                        {isClient ? (
                            <Link className={styles.portalLink} href="/client/dashboard">
                                Dashboard
                            </Link>
                        ) : isAdmin ? (
                            <Link className={styles.portalLink} href="/admin">
                                Admin
                            </Link>
                        ) : (
                            <AuthDialog />
                        )}
                    </span>
                    <button
                        ref={menuButtonRef}
                        className={styles.menuButton}
                        type="button"
                        onClick={openDrawer}
                        aria-expanded={drawerVisible}
                        aria-controls="mobile-drawer"
                        aria-label="Open navigation menu"
                    >
                        <span aria-hidden="true">☰</span>
                    </button>
                </div>
            </nav>
        {drawerVisible && (
            <div className={styles.drawerRoot} {...drawerGestures}>
                <div
                    className={`${styles.backdrop} ${drawerOpen ? styles.backdropOpen : ""}`}
                    onClick={closeDrawer}
                    aria-hidden="true"
                />
                <div
                    ref={drawerRef}
                    id="mobile-drawer"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Site navigation"
                    className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}
                >
                    <div className={styles.drawerHeader}>
                        <span className={styles.drawerBrand}>
                            <span className={styles.brandMark} aria-hidden="true">
                                N
                            </span>
                            Nexora
                        </span>
                        <button
                            className={styles.drawerClose}
                            type="button"
                            onClick={closeDrawer}
                            aria-label="Close navigation menu"
                        >
                            <span aria-hidden="true">✕</span>
                        </button>
                    </div>
                    <nav className={styles.drawerNav} aria-label="Mobile">
                        {isClient && (
                            <>
                                <Link
                                    href="/client/dashboard"
                                    onClick={closeDrawer}
                                    className={drawerLinkClass("/client/dashboard")}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/client/projects"
                                    onClick={closeDrawer}
                                    className={drawerLinkClass("/client/projects")}
                                >
                                    Projects
                                </Link>
                                <Link
                                    href="/client/support"
                                    onClick={closeDrawer}
                                    className={drawerLinkClass("/client/support")}
                                >
                                    Support
                                </Link>
                                <Link
                                    href="/client/account"
                                    onClick={closeDrawer}
                                    className={drawerLinkClass("/client/account")}
                                >
                                    Account
                                </Link>
                                <span className={styles.drawerDivider} aria-hidden="true" />
                            </>
                        )}
                        {isAdmin && (
                            <>
                                <Link
                                    href="/admin"
                                    onClick={closeDrawer}
                                    className={drawerLinkClass("/admin")}
                                >
                                    Admin dashboard
                                </Link>
                                <span className={styles.drawerDivider} aria-hidden="true" />
                            </>
                        )}
                        {!isClient && !isAdmin && (
                            <Link
                                href="/"
                                onClick={closeDrawer}
                                className={drawerLinkClass("/")}
                            >
                                Home
                            </Link>
                        )}
                        {renderDrawerGroup("services", "Services")}
                        {renderDrawerGroup("solutions", "Solutions")}
                        {publicLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={closeDrawer}
                                className={drawerLinkClass(link.href)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <span className={styles.drawerDivider} aria-hidden="true" />
                        {isClient || isAdmin ? (
                            <button
                                type="button"
                                className={styles.drawerLogout}
                                onClick={handleLogout}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Log out
                            </button>
                        ) : (
                            <>
                                <Link
                                    href="/client/login"
                                    onClick={closeDrawer}
                                    className={styles.drawerSignIn}
                                >
                                    Sign In
                                </Link>
                                {/* Opens the shared auth dialog in register
                                    mode via the existing #signup hash hook. */}
                                <a
                                    href="#signup"
                                    onClick={closeDrawer}
                                    className={styles.drawerRegister}
                                >
                                    Register
                                </a>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        )}
        </>
    );
}
