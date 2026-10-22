import type { MetadataRoute } from "next";
import { siteUrl } from "./siteUrl";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin", "/client", "/api"],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
