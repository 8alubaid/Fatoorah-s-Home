import React, { useEffect, useState } from "react";
import { AccessibilityInfo, Easing, Platform, useWindowDimensions } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/ThemeContext";
import WebSidebar from "../../src/components/WebSidebar";
import { SIDEBAR_WIDTH } from "../../src/theme";

const icon = (name) => ({ color, size }) => <Ionicons name={name} size={size - 1} color={color} />;
const isWeb = Platform.OS === "web";

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const showSidebar = isWeb && width >= 760;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  return (
    <Tabs
      // Web: a fixed left sidebar replaces the bottom tab bar; content is inset
      // past it. Native: the floating pill below.
      tabBar={showSidebar ? (props) => <WebSidebar {...props} /> : undefined}
      sceneContainerStyle={showSidebar ? { paddingLeft: SIDEBAR_WIDTH } : undefined}
      screenOptions={{
        headerShown: false,
        sceneStyle: showSidebar ? { paddingLeft: SIDEBAR_WIDTH } : undefined,
        animation: reduceMotion ? "none" : "shift",
        transitionSpec: {
          animation: "timing",
          config: {
            duration: reduceMotion ? 1 : 220,
            easing: Easing.out(Easing.cubic),
          },
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarActiveBackgroundColor: colors.tabBarActiveBg,
        // Floating, translucent, rounded "pill" that levitates above the content.
        tabBarStyle: {
          position: "absolute",
          left: 18,
          right: 18,
          bottom: Math.max(insets.bottom, 8) + 4,
          height: 62,
          borderRadius: 31,
          backgroundColor: colors.tabBar,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 8,
          elevation: 16,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
        },
        tabBarItemStyle: { height: 46, marginVertical: 8, marginHorizontal: 1, borderRadius: 22 },
        tabBarLabelStyle: { fontSize: 9.5, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard", tabBarIcon: icon("home") }} />
      <Tabs.Screen name="receipts" options={{ title: "Receipts", tabBarIcon: icon("receipt") }} />
      <Tabs.Screen name="insights" options={{ title: "Insights", tabBarIcon: icon("bar-chart") }} />
      <Tabs.Screen name="reminders" options={{ title: "Reminders", tabBarIcon: icon("alarm") }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: icon("person") }} />
    </Tabs>
  );
}
