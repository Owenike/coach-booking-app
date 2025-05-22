/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ✅ 告訴 Next.js 不要進行 export（避免 Static Export）
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
