const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
  config.resolve.alias['@'] = path.resolve(__dirname);
  return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
    typedRoutes: true,
    turbo: {}
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
