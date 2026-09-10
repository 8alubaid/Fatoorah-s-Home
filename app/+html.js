// NOTE: Expo Router only uses this file when expo.web.output is "static".
// This app is configured as "single" (SPA) in app.json, so nothing here runs
// today — the equivalent global CSS and document metadata are applied from
// app/_layout.js instead. Keep the two in sync if you ever switch to static.
import React from "react";
import { ScrollViewStyleReset } from "expo-router/html";
import "./globals.css";

export default function Root({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#F5F7F6" />
        <meta name="description" content="A clear, secure overview of your receipts, spending, budgets, and recurring payments." />
        <title>Fatoorah | Financial Overview</title>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
