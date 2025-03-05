import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /* config options here */
  reactStrictMode: true, // Enable React Strict Mode for development
  // swcMinify: true, // Enable the SWC compiler for faster minification
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
