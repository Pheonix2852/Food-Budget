/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
    typedRoutes: true,
    turbo: true
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
