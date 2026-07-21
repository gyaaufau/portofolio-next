import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-4872022002ac4f7da49af5bd4bb1f721.r2.dev",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/projects",
        destination: "/apps",
        permanent: true,
      },
      {
        source: "/projects/:slug",
        destination: "/apps/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
