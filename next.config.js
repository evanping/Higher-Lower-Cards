/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = {
  images: {
    unoptimized: true, // TODO: remove this line to enable image optimization
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};
