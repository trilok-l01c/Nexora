import type { NextConfig } from "next";

// Portfolio images are stored on the backend as root-relative paths
// (/uploads/...). The Next server proxies them to the API origin so the
// URLs resolve correctly from every device viewing the site.
const backendOrigin =
    process.env.INTERNAL_API_ORIGIN ||
    process.env.NEXT_PUBLIC_API_URL ||
    `http://127.0.0.1:${process.env.NEXT_PUBLIC_API_PORT || "4292"}`;

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Next 16 defaults to parsing `tsc --showConfig` output through its CLI
  // integration. TypeScript 5.9 emits output that this Next version cannot
  // parse here; using TypeScript's API is the supported compatible path.
  experimental: {
    useTypeScriptCli: false,
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${backendOrigin.replace(/\/+$/, "")}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
