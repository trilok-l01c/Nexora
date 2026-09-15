import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNav from "./ConditionalNav";
import { ThemeProvider } from "./ThemeProvider";
import { ClientAuthProvider } from "./client/ClientAuthContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://nexora.studio"),
    title: {
        default: "Nexora | Build what moves people",
        template: "%s | Nexora",
    },
    description:
        "Nexora builds intelligent digital products, AI systems, and experiences with momentum. Strategy, design, engineering, and intelligence in one room.",
    keywords: [
        "digital products",
        "AI systems",
        "software development",
        "cloud infrastructure",
        "web development",
        "Nexora",
    ],
    authors: [{ name: "Nexora" }],
    creator: "Nexora",
    openGraph: {
        type: "website",
        locale: "en_GB",
        siteName: "Nexora",
        title: "Nexora | Build what moves people",
        description:
            "Nexora builds intelligent digital products, AI systems, and experiences with momentum.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Nexora | Build what moves people",
        description:
            "Nexora builds intelligent digital products, AI systems, and experiences with momentum.",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
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
                                        : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
                                    document.documentElement.setAttribute("data-theme", theme);
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
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
