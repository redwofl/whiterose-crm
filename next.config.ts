import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? process.env.URL,
    AUTH_URL: process.env.AUTH_URL ?? process.env.URL,
  },
};

export default nextConfig;
