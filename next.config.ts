import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // three.js ships modern ESM; nothing to transpile. Keep the config minimal on purpose.
};

export default config;
