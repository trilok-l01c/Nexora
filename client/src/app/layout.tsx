import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import ConditionalNav from "./ConditionalNav";
import { ThemeProvider } from "./ThemeProvider";
import { ClientAuthProvider } from "./client/ClientAuthContext";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://nexora.studio"),
    title: {
        default: "Nexora | Digital growth for real businesses",
        template: "%s | Nexora",
    },
    description:
        "Nexora helps local and growing businesses build a stronger digital presence, useful software, and practical systems.",
    keywords: [
        "small business websites",
        "business software",
        "AI automation",
        "IT support",
        "web development",
        "Nexora",
    ],
    authors: [{ name: "Nexora" }],
    creator: "Nexora",
    openGraph: {
        type: "website",
        locale: "en_GB",
        siteName: "Nexora",
        title: "Nexora | Digital growth for real businesses",
        description:
            "Practical digital solutions for local and growing businesses.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Nexora | Digital growth for real businesses",
        description:
            "Practical digital solutions for local and growing businesses.",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="en-GB"
            className={`${geistSans.variable} ${geistMono.variable}`}
        >
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var stored = localStorage.getItem("nexora-theme");
                                    var theme = stored === "light" || stored === "dark"
                                        ? stored
                                        : "light";
                                    document.documentElement.setAttribute("data-theme", theme);
                                } catch (e) {
                                    document.documentElement.setAttribute("data-theme", "dark");
                                }
                            })();
                        `,
                    }}
                />
                {/* Scroll reveals ship hidden so they can animate in. Without
                    JS they must stay visible, otherwise the page would render
                    blank for no-JS users and non-executing crawlers. */}
                <noscript>
                    <style
                        dangerouslySetInnerHTML={{
                            __html: `[data-reveal]{opacity:1 !important;transform:none !important}`,
                        }}
                    />
                </noscript>
            </head>
            <body>
                <ThemeProvider>
                    <ClientAuthProvider>
                        <ConditionalNav />
                        {children}
                    </ClientAuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
