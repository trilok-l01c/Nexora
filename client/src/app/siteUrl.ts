const fallbackSiteUrl = "https://ravaite.studio";

export function resolveSiteUrl(value: string | undefined): string {
    try {
        const url = new URL(value?.trim() || fallbackSiteUrl);
        if (url.protocol !== "https:" && url.protocol !== "http:") {
            return fallbackSiteUrl;
        }
        return url.origin;
    } catch {
        return fallbackSiteUrl;
    }
}

// Keep canonical metadata valid even when deployment configuration contains
// an empty value or a placeholder instead of an absolute website URL.
export const siteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
