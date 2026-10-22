import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import ConditionalNav from "./ConditionalNav";
import { ClientAuthProvider } from "./client/ClientAuthContext";
import { siteUrl } from "./siteUrl";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Ravaite | Digital growth for real businesses",
        template: "%s | Ravaite",
    },
    description:
        "Ravaite helps local and growing businesses build a stronger digital presence, useful software, and practical systems.",
    keywords: [
        "small business websites",
        "business software",
        "AI automation",
        "IT support",
        "web development",
        "Ravaite",
    ],
    authors: [{ name: "Ravaite" }],
    creator: "Ravaite",
    openGraph: {
        type: "website",
        locale: "en_GB",
        siteName: "Ravaite",
        title: "Ravaite | Digital growth for real businesses",
        description:
            "Practical digital solutions for local and growing businesses.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Ravaite | Digital growth for real businesses",
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
                <ClientAuthProvider>
                    <ConditionalNav />
                    {children}
                </ClientAuthProvider>
            </body>
        </html>
    );
}
