/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/*",
      },
    ],
  },

  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  }
};

module.exports = nextConfig;
