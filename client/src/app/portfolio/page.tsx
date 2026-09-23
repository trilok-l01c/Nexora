"use client";

import Link from "next/link";
import { useCardTilt } from "../components/cursor/useCardTilt";
import { formatPortfolioDate, type PortfolioProject } from "../portfolioTypes";
import { useState, useEffect } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";

export default function PortfolioPage() {
    const [projects, setProjects] = useState<PortfolioProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProjects() {
            try {
                const response = await fetch(`${apiUrl}/api/portfolio`, {
                    cache: "no-store",
                });
                const result = await response.json();
                if (response.ok && result.success && Array.isArray(result.data)) {
                    setProjects(result.data as PortfolioProject[]);
                }
            } catch {
                // Handle error silently
            } finally {
                setLoading(false);
            }
        }
        loadProjects();
    }, []);

    return (
        <main className="portfolio-page" data-motion-page>
            <header className="portfolio-hero">
                <div className="portfolio-heroCopy" data-motion="hero-copy">
                    <p className="portfolio-kicker">Selected work</p>
                    <h1>Useful ideas, <em>made visible.</em></h1>
                    <p className="portfolio-intro">A closer look at the digital experiences, systems, and foundations we create for businesses ready to move forward.</p>
                </div>
                <div className="portfolio-heroPhoto" data-motion="hero-media">
                    <img src="/city-in-night.jpg" alt="City at night, representing connected digital business" />
                </div>
            </header>
            <section className="portfolio-listing" aria-label="Portfolio projects">
                <div className="portfolio-listingHeader">
                    <p className="portfolio-kicker">The work</p>
                    <span className="portfolio-count">
                        {projects.length} project{projects.length === 1 ? "" : "s"}
                    </span>
                </div>
                {loading ? (
                    <p className="portfolio-emptyState">Loading projects...</p>
                ) : projects.length === 0 ? (
                    <p className="portfolio-emptyState">
                        <strong>The portfolio is being curated.</strong>
                        Projects are being prepared for publication. Check back soon.
                    </p>
                ) : (
                    <div className="portfolio-projectGrid">
                        {projects.map((project) => (
                            <ProjectCard key={project._id} project={project} />
                        ))}
                    </div>
                )}
            </section>
            <section className="portfolio-contactCTA">
                <p className="portfolio-kicker">Make a move</p>
                <h2>
                    Want work like this?
                    <br />
                    <em>Let&apos;s build it.</em>
                </h2>
                <a
                    className="portfolio-primaryButton"
                    href="mailto:hello@nexora.studio"
                >
                    hello@nexora.studio <span aria-hidden="true">↗</span>
                </a>
            </section>
        </main>
    );
}

function ProjectCard({ project }: { project: PortfolioProject }) {
    const { ref, pos } = useCardTilt();

    return (
        <Link
            ref={ref}
            href={`/portfolio/${project._id}`}
            className="portfolio-card"
            style={{
                transform: `perspective(1000px) rotateX(${pos.y}deg) rotateY(${pos.x}deg)`,
            }}
        >
            {project.coverImage ? (
                <img
                    src={project.coverImage}
                    alt={project.title}
                    loading="lazy"
                />
            ) : (
                <div className="portfolio-mediaPlaceholder" aria-hidden="true">
                    {project.category.slice(0, 2).toUpperCase()}
                </div>
            )}
            <div className="portfolio-cardBody">
                <div className="portfolio-cardMeta">
                    <span className="portfolio-category">{project.category}</span>
                    {project.featured && (
                        <span className="portfolio-featuredBadge">Featured</span>
                    )}
                </div>
                <h2 className="portfolio-cardTitle">{project.title}</h2>
                <p className="portfolio-cardText">{project.shortDescription}</p>
                {project.technologies && project.technologies.length > 0 && (
                    <div className="portfolio-techLine">
                        {project.technologies.slice(0, 4).join(" · ")}
                    </div>
                )}
                <div className="portfolio-cardFoot">
                    {project.completionDate && (
                        <time dateTime={project.completionDate}>
                            {formatPortfolioDate(project.completionDate)}
                        </time>
                    )}
                    <span>View project ↗</span>
                </div>
            </div>
        </Link>
    );
}