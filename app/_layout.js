import React, { useEffect } from "react";
import { Platform } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
// Global web CSS (fonts, scrollbars, focus rings, selection colour). Imported
// here rather than from app/+html.js because that file only runs when
// expo.web.output is "static" — this app ships as "single" (SPA), where a
// plain CSS import is the supported way to load global styles. No-op on native.
import "./globals.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BankProvider } from "../src/bank/BankContext";
import { ThemeProvider, useTheme } from "../src/ThemeContext";
import { darkColors, lightColors } from "../src/theme";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";
import { BudgetProvider } from "../src/settings/BudgetContext";

function InnerLayout() {
  const { colors, isDark } = useTheme();
  const { session, loading, configured, demo } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Route gating — only once Supabase is configured. Signed-out users are sent
  // to /auth; signed-in users (or demo mode) on /auth are sent into the app.
  useEffect(() => {
    if (!configured || loading) return;
    const onAuthScreen = segments[0] === "auth";
    const authed = !!session || demo;
    if (!authed && !onAuthScreen) router.replace("/auth");
    else if (authed && onAuthScreen) router.replace("/(tabs)");
  }, [configured, loading, session, demo, segments]);

  // Document metadata. app/+html.js declares the same values but is inert under
  // SPA output, so apply them here for the browser tab and link previews.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    document.title = "Fatoorah | Financial Overview";
    const meta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    meta(
      "description",
      "A clear, secure overview of your receipts, spending, budgets, and recurring payments."
    );
    meta("theme-color", isDark ? darkColors.bg : lightColors.bg);
  }, [isDark]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="connect" options={{ presentation: "modal" }} />
        <Stack.Screen name="import" options={{ presentation: "modal" }} />
        <Stack.Screen name="auth" />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <BudgetProvider>
            <BankProvider>
              <InnerLayout />
            </BankProvider>
          </BudgetProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
