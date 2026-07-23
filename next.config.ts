import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pkzdlrxgfwlklomdwgfz.supabase.co",
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
