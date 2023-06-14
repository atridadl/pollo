// @ts-check
import withPWA from "next-pwa";

!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com"],
  },
  webpack: (config, { dev, isServer }) => {
    Object.assign(config.resolve.alias, {
      "react/jsx-runtime.js": "preact/compat/jsx-runtime",
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
    });
    return config;
  },
};
const nextConfig = withPWA({
  dest: "public",
})(config);
export default nextConfig;
