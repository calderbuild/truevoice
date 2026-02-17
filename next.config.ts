import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://worldcoin.org https://*.worldcoin.org https://world.org https://*.world.org",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
