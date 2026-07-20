import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
