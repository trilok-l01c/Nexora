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
