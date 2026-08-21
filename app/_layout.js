import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BankProvider } from "../src/bank/BankContext";
import { ThemeProvider, useTheme } from "../src/ThemeContext";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";

function InnerLayout() {
  const { colors, isDark } = useTheme();
  const { session, loading, configured } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Route gating — only once Supabase is configured. Signed-out users are sent
  // to /auth; signed-in users on /auth are sent into the app.
  useEffect(() => {
    if (!configured || loading) return;
    const onAuthScreen = segments[0] === "auth";
    if (!session && !onAuthScreen) router.replace("/auth");
    else if (session && onAuthScreen) router.replace("/(tabs)");
  }, [configured, loading, session, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="connect" options={{ presentation: "modal" }} />
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
          <BankProvider>
            <InnerLayout />
          </BankProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
