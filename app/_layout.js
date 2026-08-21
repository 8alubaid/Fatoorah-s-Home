import React, { useEffect } from "react";
import { Platform, View, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BankProvider } from "../src/bank/BankContext";
import { ThemeProvider, useTheme } from "../src/ThemeContext";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";

const isWeb = Platform.OS === "web";
// On desktop web the app would otherwise stretch edge-to-edge. Keep it in a
// centered, phone-width column (a "phone on a desk" frame). Native is untouched.
const APP_MAX_WIDTH = 480;

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

  const frameStyle = isWeb
    ? {
        // position:relative so the floating tab bar's absolute left/right:18
        // anchors to this 480px column instead of the full window.
        position: "relative",
        flex: 1,
        width: "100%",
        maxWidth: APP_MAX_WIDTH,
        overflow: "hidden",
        backgroundColor: colors.bg,
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderRightWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
      }
    : { flex: 1, width: "100%" };

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        alignItems: "center",
        // Subtle gutter behind the centered frame (only visible on wide web).
        backgroundColor: isWeb ? colors.surfaceAlt : colors.bg,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={frameStyle}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="connect" options={{ presentation: "modal" }} />
          <Stack.Screen name="auth" />
        </Stack>
      </View>
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
