/** @type {import('next').NextConfig} */
// Next.js configuration
// This file configures Next.js - path aliases, images, webpack

const path = require('path');

const nextConfig = {
  // Resolve @/ alias from client root - always use absolute path
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },

  // Allow external domains for images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

module.exports = nextConfig;
