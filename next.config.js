// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Option A: simple allow-list
    domains: ["i.imgur.com"],

    // or Option B: remotePatterns (more control)
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "i.imgur.com",
    //   },
    // ],
  },
};

module.exports = nextConfig;
