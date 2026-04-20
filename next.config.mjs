import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Only scope tracing to the project root in local dev (to silence the parent-
// lockfile warning). On Netlify / Vercel, let the platform's adapter control
// tracing so it can bundle every file the serverless functions need.
const isHostedBuild =
  !!process.env.NETLIFY || !!process.env.VERCEL || !!process.env.CF_PAGES;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isHostedBuild ? {} : { outputFileTracingRoot: __dirname }),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
};

export default nextConfig;
