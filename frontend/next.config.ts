import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true, // Redirection 308 (recommandé pour le SEO et la performance)
      },
    ];
  },
};

export default nextConfig;