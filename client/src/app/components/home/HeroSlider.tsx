"use client";

import { useEffect, useState } from "react";

type HeroSlide = {
    image: string;
    alt: string;
    title: string;
};

type HeroSliderProps = {
    slides: HeroSlide[];
};

export default function HeroSlider({ slides }: HeroSliderProps) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 7000);

        return () => clearInterval(interval);
    }, [slides.length]);

    const next = () => {
        setCurrent((prev) => (prev + 1) % slides.length);
    };

    const prev = () => {
        setCurrent((prev) => prev - 1 + slides.length);
    };

    const goTo = (index: number) => {
        setCurrent(index);
    };

    return (
        <section className="hero">
            <style>{`
                @keyframes nxGlowPulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>
            <div className="heroContent">
                <div className="heroText">
                    <p className="kicker">
                        <span className="kickerDot" /> 
                        Digital growth for real businesses
                    </p>
                    <h1 className="heroTitle">
                        Make your business <em>{slides[current].title}</em>
                    </h1>
                    <p className="lead">
                        Nexora helps local and growing businesses show up professionally, 
                        serve customers better, and spend less time fighting with technology. 
                        Powered by deep understanding of Indian markets and real user needs.
                    </p>
                    <div className="heroActions">
                        <a href="#contact" className="primary">
                            Start a conversation <span aria-hidden="true">↗</span>
                        </a>
                        <a href="/what-we-do" className="textLink">
                            See what we do <span aria-hidden="true">↗</span>
                        </a>
                    </div>
                    {slides.length > 1 && (
                        <div className="dots">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    className={`dot ${index === current ? "activeDot" : ""}`}
                                    onClick={() => goTo(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="heroImages">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`slide ${index === current ? "active" : ""}`}
                        >
                            <img
                                src={slide.image}
                                alt={slide.alt}
                                className="slideImage"
                                loading={index === current ? "eager" : "lazy"}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}