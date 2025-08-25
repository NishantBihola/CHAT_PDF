// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["i.imgur.com"],
    // or use remotePatterns like the JS example (uncomment one approach)
  },
};

export default nextConfig;
