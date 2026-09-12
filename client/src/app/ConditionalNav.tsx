"use client";

import { usePathname } from "next/navigation";
import Nav from "./components/home/Nav";

export default function ConditionalNav() {
    return usePathname().startsWith("/client") ? null : <Nav />;
}
