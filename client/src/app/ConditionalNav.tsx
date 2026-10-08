"use client";

import { usePathname } from "next/navigation";
import Nav from "./components/home/Nav";

export default function ConditionalNav() {
    const pathname = usePathname();

    // The client portal and admin workspace provide their own navigation.
    // Keeping the public-site header out of these routes also lets the admin
    // sign-in page occupy the complete viewport.
    return pathname.startsWith("/client") || pathname.startsWith("/admin")
        ? null
        : <Nav />;
}
