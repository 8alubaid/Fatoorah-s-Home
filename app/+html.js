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
