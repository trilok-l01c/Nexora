import type { MetadataRoute } from "next";
import { allServices } from "./services";
import { siteUrl } from "./siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = siteUrl;
    const now = new Date();

    const serviceUrls = allServices.map((service) => ({
        url: `${baseUrl}/services/${service.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/portfolio`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        ...serviceUrls,
    ];
}
