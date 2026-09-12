import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNav from "./ConditionalNav";
import { ThemeProvider } from "./ThemeProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Nexora | Build what moves people",
    description:
        "Nexora builds intelligent digital products, AI systems, and experiences with momentum.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="en"
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
                    <ConditionalNav />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
