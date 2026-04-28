import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "ontology.live",
    "www.ontology.live",
  ],
  output: 'standalone',
  devIndicators: false,
  experimental: {
    middlewareClientMaxBodySize: '50mb',
  },
  async redirects() {
    return [
      {
        source: '/pricing',
        destination: '/#pricing',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
