// Left sidebar navigation for the web build. Passed as the `tabBar` to expo-router
// <Tabs> on web only; native keeps the floating bottom pill. Renders the same
// routes React Navigation manages, so navigation/active state stay in sync.
import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemedStyles } from "../ThemeContext";
import { spacing, radius, SIDEBAR_WIDTH } from "../theme";

const LOGO_LIGHT = require("../../assets/logo-light.png");
const LOGO_DARK = require("../../assets/logo-dark.png");

// Icon per route (route name -> Ionicons name).
const ICONS = {
  index: "home-outline",
  receipts: "receipt-outline",
  insights: "bar-chart-outline",
  reminders: "alarm-outline",
  profile: "person-outline",
};
const ICONS_ACTIVE = {
  index: "home",
  receipts: "receipt",
  insights: "bar-chart",
  reminders: "alarm",
  profile: "person",
};

export default function WebSidebar({ state, descriptors, navigation }) {
  const { colors, isDark, toggle } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.sidebar}>
      {/* Brand */}
      <View style={styles.brandRow}>
        <View style={[styles.logoTile, { backgroundColor: isDark ? "#0F1013" : "#FFFFFF" }]}>
          <Image source={isDark ? LOGO_DARK : LOGO_LIGHT} style={styles.logoImg} resizeMode="cover" />
        </View>
        <Text style={styles.brand}>Fatoorah</Text>
      </View>

      {/* Nav items */}
      <View style={styles.nav}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ hovered }) => [
                styles.item,
                hovered && styles.itemHover,
                focused && styles.itemActive,
              ]}
            >
              <Ionicons
                name={(focused ? ICONS_ACTIVE : ICONS)[route.name] || "ellipse-outline"}
                size={20}
                color={focused ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.itemLabel, focused && styles.itemLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Footer: theme toggle */}
      <Pressable onPress={toggle} style={({ hovered }) => [styles.item, hovered && styles.itemHover]}>
        <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={colors.textMuted} />
        <Text style={styles.itemLabel}>{isDark ? "Dark" : "Light"} mode</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    sidebar: {
      // `fixed` keeps the sidebar in place while the content scrolls (web only).
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      width: SIDEBAR_WIDTH,
      backgroundColor: colors.surface,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.xl,
    },
    logoTile: {
      width: 40,
      height: 40,
      borderRadius: 11,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    logoImg: { width: "100%", height: "100%" },
    brand: { color: colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
    nav: { flex: 1, gap: 4 },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingVertical: 11,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      cursor: "pointer",
    },
    itemHover: { backgroundColor: colors.surfaceAlt },
    itemActive: { backgroundColor: colors.tabBarActiveBg },
    itemLabel: { color: colors.textMuted, fontSize: 15, fontWeight: "600" },
    itemLabelActive: { color: colors.primary, fontWeight: "700" },
  });
