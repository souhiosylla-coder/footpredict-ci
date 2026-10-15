/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api-sports.io",
        pathname: "/**",
      },
    ],
    unoptimized: true,
  },
  typescript: {
    // Évite un échec de build sur des warnings TS non bloquants
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
