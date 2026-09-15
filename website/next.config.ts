import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // The repo root also has a package-lock (the Expo app). Pin Turbopack's root
  // to this folder so it doesn't guess the wrong workspace.
  turbopack: { root: path.resolve(__dirname) },
};

export default withNextIntl(nextConfig);
