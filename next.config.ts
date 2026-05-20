import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async rewrites() {
    return [
      { source: '/pwc/', destination: '/pwc/index.html' },
    ];
  },
};

export default nextConfig;
