"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useClientAuth } from "../../client/ClientAuthContext";
import styles from "./Nav.module.css";

const links = [
    { label: "Who we are", href: "/who-we-are" },
    { label: "What we do", href: "/what-we-do" },
    { label: "Our work", href: "/portfolio" },
    { label: "For clients", href: "/clients" },
];

export default function Nav() {
    const pathname = usePathname();
    const router = useRouter();
    const { status, user, logout } = useClientAuth();
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
                <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
                    <span className={styles.brandMark}>N</span><span>Nexora</span>
                </Link>
                <div className={styles.links}>
                    {links.map((link) => <Link key={link.href} href={link.href} className={pathname.startsWith(link.href) ? styles.active : undefined}>{link.label}</Link>)}
                </div>
                <div className={styles.actions}>
                    {isClient ? <Link className={styles.portal} href="/client/dashboard">Client portal</Link> : !isSignedIn ? <Link className={styles.signIn} href="/client/login">Sign in</Link> : null}
                    {isSignedIn && <button className={styles.signOut} onClick={handleLogout}>Sign out</button>}
                    <Link className={styles.cta} href="/#contact">Let&apos;s talk <span>→</span></Link>
                    <button className={styles.menu} type="button" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /></button>
                </div>
            </nav>
            {open && <div className={styles.mobile}>{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}{!isSignedIn && <Link href="/client/login" onClick={() => setOpen(false)}>Sign in</Link>}<Link href="/#contact" onClick={() => setOpen(false)}>Let&apos;s talk</Link></div>}
        </header>
    );
}
