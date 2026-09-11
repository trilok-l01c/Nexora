"use client";

import { useEffect, useState } from "react";
import Approach from "./components/home/Approach";
import Contact from "./components/home/Contact";
import Footer from "./components/home/Footer";
import Hero from "./components/home/Hero";
import Industries from "./components/home/Industries";
import Solutions from "./components/home/Solutions";
import Ticker from "./components/home/Ticker";
import styles from "./page.module.css";
import { defaultHomeContent, type HomeContent } from "./homeContent";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";

export default function Home() {
    const [content, setContent] = useState<HomeContent>(defaultHomeContent);

    useEffect(() => {
        fetch(`${apiUrl}/api/home`)
            .then((response) => response.json())
            .then((result) => {
                if (result.success && result.data) {
                    setContent({
                        ...defaultHomeContent,
                        ...result.data,
                        hero: {
                            ...defaultHomeContent.hero,
                            ...result.data.hero,
                        },
                        approach: {
                            ...defaultHomeContent.approach,
                            ...result.data.approach,
                        },
                        ticker: result.data.ticker || defaultHomeContent.ticker,
                        solutions:
                            result.data.solutions ||
                            defaultHomeContent.solutions,
                        industries:
                            result.data.industries ||
                            defaultHomeContent.industries,
                        stats: result.data.stats || defaultHomeContent.stats,
                    });
                }
            })
            .catch(() => undefined);
    }, []);

    return (
        <main className={styles.page}>
            <Hero content={content.hero} />
            <Ticker items={content.ticker} />
            <Solutions cards={content.solutions} />
            <Industries industries={content.industries} />
            <Approach content={content.approach} stats={content.stats} />
            <Contact />
            <Footer />
        </main>
    );
}
