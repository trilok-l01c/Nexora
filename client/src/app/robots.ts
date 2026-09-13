import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://nexora.studio";
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin", "/client", "/api"],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
