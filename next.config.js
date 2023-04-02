/** @type {import('next').NextConfig} */
const runtimeCaching = require("next-pwa/cache");
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching,
});

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    domains: [
      "platform-lookaside.fbsbx.com",
      "firebasestorage.googleapis.com",
      "lh3.googleusercontent.com",
      "upload.wikimedia.org",
      "cdn.sanity.io",
      "images.dubizzle.com",
      "res.cloudinary.com",
      "images.unsplash.com",
    ],
  },
  swcMinify: true,
});
