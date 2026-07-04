import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/ThemeContext";

const icon = (name) => ({ color, size }) => <Ionicons name={name} size={size - 1} color={color} />;

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
        tabBarItemStyle: { height: 46, marginVertical: 8, marginHorizontal: 4, borderRadius: 22 },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: "600" },
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
