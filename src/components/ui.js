import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing } from "../theme";
import { useTheme, useThemedStyles } from "../ThemeContext";

export function Card({ children, style }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ThemeToggle() {
  const { colors, isDark, toggle } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable onPress={toggle} hitSlop={10} style={styles.themeToggle}>
      <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={20} color={colors.textMuted} />
    </Pressable>
  );
}

export function ScreenHeader({ title, subtitle }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      <ThemeToggle />
    </View>
  );
}

export function SectionTitle({ children, right }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right ? <Text style={styles.sectionRight}>{right}</Text> : null}
    </View>
  );
}

export function ProgressBar({ value, max, color }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: color || colors.primary }]} />
    </View>
  );
}

export function Chip({ label, active, onPress, color }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: color || colors.primary, borderColor: color || colors.primary },
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Avatar({ emoji, color }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.avatar, { backgroundColor: (color || colors.primary) + "22" }]}>
      <Text style={styles.avatarEmoji}>{emoji}</Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled, style }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
        style,
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ emoji, title, message, buttonLabel, onPress }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
      {buttonLabel ? (
        <PrimaryButton label={buttonLabel} onPress={onPress} style={{ marginTop: spacing.lg }} />
      ) : null}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    headerTitle: { color: colors.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
    headerSubtitle: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
    themeToggle: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
      marginTop: spacing.lg,
    },
    sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "700" },
    sectionRight: { color: colors.primary, fontSize: 13, fontWeight: "600" },
    progressTrack: {
      height: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      overflow: "hidden",
    },
    progressFill: { height: "100%", borderRadius: radius.pill },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.sm,
    },
    chipText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
    chipTextActive: { color: colors.white },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarEmoji: { fontSize: 20 },
    button: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: spacing.xl,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonPressed: { opacity: 0.85 },
    buttonDisabled: { backgroundColor: colors.surfaceAlt },
    buttonText: { color: colors.white, fontSize: 16, fontWeight: "700" },
    empty: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
    emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
    emptyTitle: { color: colors.text, fontSize: 20, fontWeight: "800", textAlign: "center" },
    emptyMessage: { color: colors.textMuted, fontSize: 14, textAlign: "center", marginTop: spacing.sm, lineHeight: 20 },
  });
