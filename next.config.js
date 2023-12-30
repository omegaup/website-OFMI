/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    swcPlugins: [["@swc-jotai/react-refresh", {}]],
  },
};

module.exports = nextConfig;
