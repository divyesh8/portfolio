import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root; a stray lockfile in the home directory would
  // otherwise be picked up instead of this project.
  outputFileTracingRoot: import.meta.dirname,
  poweredByHeader: false,
  devIndicators: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

// Keep a running local preview from overwriting the production build's manifests.
export default function config(phase) {
  return phase === PHASE_DEVELOPMENT_SERVER
    ? { ...nextConfig, distDir: ".next-dev" }
    : nextConfig;
}
