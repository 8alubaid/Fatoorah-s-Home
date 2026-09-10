// Floating bottom tab bar for phones and narrow web.
//
// Replaces React Navigation's default bar, which can only paint a flat
// background colour on the whole tab item — that produced a boxy rectangle and
// left no way to animate the highlight. Here the active pill is a single
// absolutely-positioned view that slides between tabs.
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Animated, Easing, Platform, AccessibilityInfo } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, useThemedStyles } from "../ThemeContext";
import { FONT_SANS } from "../theme";

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

const BAR_HEIGHT = 64;
const ITEM_HEIGHT = 52;
const H_PADDING = 6;

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();

  const [barWidth, setBarWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => sub.remove();
  }, []);

  const count = state.routes.length;
  const itemWidth = barWidth > 0 ? (barWidth - H_PADDING * 2) / count : 0;

  // The sliding highlight. Kept in a ref so it survives re-renders.
  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const target = state.index * itemWidth;
    if (itemWidth === 0) {
      slide.setValue(target); // pre-layout: jump, don't animate from nowhere
      return;
    }
    Animated.timing(slide, {
      toValue: target,
      duration: reduceMotion ? 0 : 260,
      easing: Easing.out(Easing.cubic),
      // RNW has no native driver; transforms still animate fine in JS there.
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [state.index, itemWidth, reduceMotion, slide]);

  return (
    <View
      style={[styles.bar, { bottom: Math.max(insets.bottom, 8) + 4 }]}
      onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      accessibilityRole="tablist"
    >
      {itemWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.pill, { width: itemWidth, transform: [{ translateX: slide }] }]}
        />
      ) : null}

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
            accessibilityLabel={label}
            // react-native-web doesn't emit aria-selected from accessibilityState
            // for this role, so screen readers wouldn't announce which tab is
            // current. Set it explicitly on web.
            {...(Platform.OS === "web" ? { "aria-selected": focused } : null)}
            style={styles.item}
          >
            <Ionicons
              name={(focused ? ICONS_ACTIVE : ICONS)[route.name] || "ellipse-outline"}
              size={21}
              color={focused ? colors.primary : colors.textFaint}
            />
            <Text
              numberOfLines={1}
              style={[styles.label, focused && styles.labelActive]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    bar: {
      position: "absolute",
      left: 18,
      right: 18,
      height: BAR_HEIGHT,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: H_PADDING,
      borderRadius: BAR_HEIGHT / 2,
      backgroundColor: colors.tabBar,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 16,
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    // Fully rounded ends — a pill, not a rectangle with soft corners.
    pill: {
      position: "absolute",
      left: H_PADDING,
      height: ITEM_HEIGHT,
      borderRadius: ITEM_HEIGHT / 2,
      backgroundColor: colors.tabBarActiveBg,
    },
    item: {
      flex: 1,
      height: ITEM_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      borderRadius: ITEM_HEIGHT / 2,
      cursor: "pointer",
    },
    label: {
      color: colors.textFaint,
      // 11px with real line-height: the old 9.5px rendered muddy on Windows and
      // Linux, and clipped descenders inside the previous fixed item height.
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "600",
      letterSpacing: 0.1,
      fontFamily: FONT_SANS,
      textAlign: "center",
      includeFontPadding: false,
    },
    labelActive: { color: colors.primary, fontWeight: "700" },
  });
