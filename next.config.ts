import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.devinapps.com",
    "*.trycloudflare.com",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.devinapps.com",
        "*.trycloudflare.com",
      ],
    },
  },
};

export default nextConfig;
