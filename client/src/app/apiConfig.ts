// Single source of truth for every frontend fetch. NEXT_PUBLIC_API_URL is
// inlined at build time; when it is not configured, the API is assumed to run
// on the same host the site is being viewed from (development layout), which
// keeps authentication cookies same-site and makes LAN testing (e.g.
// http://192.168.1.9:3000) work on any address without code changes.
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
const configuredApiPort = process.env.NEXT_PUBLIC_API_PORT || "4292";

export const apiUrl: string = (() => {
    if (configuredApiUrl) return configuredApiUrl.replace(/\/+$/, "");
    if (typeof window === "undefined") {
        // Server-side rendering and server components fetch directly from the
        // backend on the same machine. INTERNAL_API_ORIGIN exists for setups
        // where that is not reachable (e.g. docker-compose service names).
        return (
            process.env.INTERNAL_API_ORIGIN ||
            `http://127.0.0.1:${configuredApiPort}`
        );
    }
    return `${window.location.protocol}//${window.location.hostname}:${configuredApiPort}`;
})();

// Uploaded portfolio assets live on the backend and are stored as
// root-relative paths (/uploads/...). The Next server proxies /uploads to the
// backend (see next.config.ts), so root-relative URLs resolve correctly from
// every device. Legacy records may contain absolute localhost URLs baked in
// before the proxy existed; normalize those to root-relative so they resolve
// through the proxy everywhere instead of pointing a phone at its own host.
export function resolveAssetUrl(value: string | undefined | null): string {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    const localhostPattern =
        /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(\/\S*)?$/i;
    const match = trimmed.match(localhostPattern);
    if (match) return match[1] || "";
    return trimmed;
}