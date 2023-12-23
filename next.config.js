/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "simg-ssl.duolingo.com",
      },
    ],
  },
};

module.exports = nextConfig;
