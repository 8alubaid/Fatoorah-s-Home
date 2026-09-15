// Metro config for the Expo app.
//
// The repo also holds the Next.js marketing site in /website, with its own
// node_modules and its own copy of React. Left alone, Metro would crawl it and
// hit duplicate-module collisions, so it is excluded from the app bundle.
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const websiteDir = new RegExp(`^${escape(path.resolve(__dirname, "website"))}[\\\\/].*`);

const existing = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
  websiteDir,
];

module.exports = config;
