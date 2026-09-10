import React, { useEffect, useState } from "react";
import { AccessibilityInfo, Easing } from "react-native";
import { Tabs } from "expo-router";
import WebSidebar from "../../src/components/WebSidebar";
import FloatingTabBar from "../../src/components/FloatingTabBar";
import { SIDEBAR_WIDTH } from "../../src/theme";
import { useShowSidebar } from "../../src/useLayout";

export default function TabsLayout() {
  const showSidebar = useShowSidebar();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  return (
    <Tabs
      // Wide web gets the sidebar; everything else gets the floating pill. Both
      // are custom so the active highlight can be a real animated pill rather
      // than React Navigation's flat per-item background colour.
      tabBar={(props) => (showSidebar ? <WebSidebar {...props} /> : <FloatingTabBar {...props} />)}
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
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="receipts" options={{ title: "Receipts" }} />
      <Tabs.Screen name="insights" options={{ title: "Insights" }} />
      <Tabs.Screen name="reminders" options={{ title: "Reminders" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
