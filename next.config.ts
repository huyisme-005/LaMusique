/**
 * @fileOverview Configuration file for Next.js.
 * Defines settings for the Next.js application, including image optimization,
 * build configurations, and other framework-specific options.
 */
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // typescript: {
  //   ignoreBuildErrors: true, // Temporarily removed to surface potential build-time errors
  // },
  eslint: {
    ignoreDuringBuilds: true, // Keeping this for now, but ideally also false
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
