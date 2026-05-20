import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/pwc', destination: '/pwc/', permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: '/pwc/', destination: '/pwc/index.html' },
    ];
  },
};

export default nextConfig;
