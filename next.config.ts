import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? process.env.URL,
    AUTH_URL: process.env.AUTH_URL ?? process.env.URL,
  },
};

export default nextConfig;

// Required for OpenNext + Cloudflare: lets the Next.js dev server access
// Cloudflare bindings (env, D1, R2, etc.) during local development.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
