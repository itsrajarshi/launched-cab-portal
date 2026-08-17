import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },
      {
        source: "/login/company",
        destination: "/auth/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
