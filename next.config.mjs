import "./env.mjs";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
        pathname: "/.*",
        protocol: "https",
        port: "443",
      },
      {
        hostname: "lh3.googleusercontent.com",
        pathname: "/.*",
        protocol: "https",
        port: "443",
      },
      {
        hostname: "img.clerk.com",
        pathname: "/.*",
        protocol: "https",
        port: "443",
      },
    ],
  },
};

export default config;
