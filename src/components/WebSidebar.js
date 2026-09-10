import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemedStyles } from "../ThemeContext";
import { spacing, radius, SIDEBAR_WIDTH } from "../theme";

const LOGO_LIGHT = require("../../assets/logo-light.png");
const LOGO_DARK = require("../../assets/logo-dark.png");

const ICONS = {
  index: "grid-outline",
  receipts: "receipt-outline",
  insights: "analytics-outline",
  reminders: "calendar-outline",
  profile: "person-circle-outline",
};
const ICONS_ACTIVE = {
  index: "grid",
  receipts: "receipt",
  insights: "analytics",
  reminders: "calendar",
  profile: "person-circle",
};

export default function WebSidebar({ state, descriptors, navigation }) {
  const { colors, isDark, toggle } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandRow}>
        <View style={[styles.logoTile, { backgroundColor: isDark ? "#0F1513" : "#FFFFFF" }]}>
          <Image source={isDark ? LOGO_DARK : LOGO_LIGHT} style={styles.logoImg} resizeMode="cover" />
        </View>
        <View>
          <Text style={styles.brand}>Fatoorah</Text>
          <Text style={styles.brandMeta}>FINANCIAL OVERVIEW</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>WORKSPACE</Text>
      <View style={styles.nav}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
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
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              style={({ hovered, pressed }) => [
                styles.item,
                hovered && !focused && styles.itemHover,
                focused && styles.itemActive,
                pressed && styles.itemPressed,
              ]}
            >
              {focused ? <View style={styles.activeIndicator} /> : null}
              <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
                <Ionicons
                  name={(focused ? ICONS_ACTIVE : ICONS)[route.name] || "ellipse-outline"}
                  size={19}
                  color={focused ? colors.primary : colors.textMuted}
                />
              </View>
              <Text style={[styles.itemLabel, focused && styles.itemLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <Pressable
          onPress={toggle}
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${isDark ? "light" : "dark"} mode`}
          style={({ hovered, pressed }) => [styles.item, hovered && styles.itemHover, pressed && styles.itemPressed]}
        >
          <View style={styles.iconBox}>
            <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={19} color={colors.textMuted} />
          </View>
          <View style={styles.themeCopy}>
            <Text style={styles.itemLabel}>Appearance</Text>
            <Text style={styles.themeMeta}>{isDark ? "Dark mode" : "Light mode"}</Text>
          </View>
          <Ionicons name="chevron-forward" size={15} color={colors.textFaint} />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    sidebar: {
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
      zIndex: 10,
    },
    brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.sm, marginBottom: spacing.xxl },
    logoTile: { width: 38, height: 38, borderRadius: radius.md, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
    logoImg: { width: "100%", height: "100%" },
    brand: { color: colors.text, fontSize: 18, fontWeight: "700", letterSpacing: -0.35 },
    brandMeta: { color: colors.textFaint, fontSize: 8.5, fontWeight: "700", letterSpacing: 1.1, marginTop: 2 },
    sectionLabel: { color: colors.textFaint, fontSize: 10, fontWeight: "700", letterSpacing: 1.25, marginHorizontal: spacing.md, marginBottom: spacing.sm },
    nav: { flex: 1, gap: 3 },
    item: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: 7,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
      cursor: "pointer",
      position: "relative",
    },
    itemHover: { backgroundColor: colors.surfaceAlt },
    itemActive: { backgroundColor: colors.tabBarActiveBg },
    itemPressed: { opacity: 0.74, transform: [{ scale: 0.99 }] },
    activeIndicator: { position: "absolute", left: 0, width: 3, height: 24, borderRadius: 2, backgroundColor: colors.primary },
    iconBox: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: radius.sm },
    iconBoxActive: { backgroundColor: colors.primarySoft },
    itemLabel: { color: colors.textMuted, fontSize: 14, fontWeight: "600" },
    itemLabelActive: { color: colors.text, fontWeight: "700" },
    footer: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg },
    themeCopy: { flex: 1 },
    themeMeta: { color: colors.textFaint, fontSize: 11, marginTop: 1 },
  });
