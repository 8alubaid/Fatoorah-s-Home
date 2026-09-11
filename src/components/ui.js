import React from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing } from "../theme";
import { useTheme, useThemedStyles } from "../ThemeContext";

export function ScreenLoading({ label }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.loading} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? <Text style={styles.loadingLabel}>{label}</Text> : null}
    </View>
  );
}

export function Card({ children, style }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ThemeToggle() {
  const { colors, isDark, toggle } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={toggle}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${isDark ? "light" : "dark"} mode`}
      style={({ hovered, pressed }) => [styles.themeToggle, hovered && styles.controlHover, pressed && styles.controlPressed]}
    >
      <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={19} color={colors.textMuted} />
    </Pressable>
  );
}

export function ScreenHeader({ title, subtitle }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text accessibilityRole="header" style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      {Platform.OS === "web" ? null : <ThemeToggle />}
    </View>
  );
}

export function SectionTitle({ children, right }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {typeof right === "string" || typeof right === "number" ? (
        <Text style={styles.sectionRight}>{right}</Text>
      ) : (
        right ?? null
      )}
    </View>
  );
}

export function ProgressBar({ value, max, color }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View
      style={styles.progressTrack}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: Math.min(value, max) }}
    >
      <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: color || colors.primary }]} />
    </View>
  );
}

export function Chip({ label, active, onPress, color }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const activeColor = color || colors.primary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ hovered, pressed }) => [
        styles.chip,
        hovered && !active && styles.chipHover,
        active && { backgroundColor: activeColor, borderColor: activeColor },
        pressed && styles.controlPressed,
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Avatar({ emoji, icon, color, label }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const accent = color || colors.primary;
  return (
    <View style={[styles.avatar, { backgroundColor: `${accent}18`, borderColor: `${accent}30` }]} accessibilityLabel={label}>
      {icon ? <Ionicons name={icon} size={20} color={accent} /> : <Text style={styles.avatarEmoji}>{emoji}</Text>}
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled, style }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ hovered, pressed }) => [
        styles.button,
        hovered && !disabled && styles.buttonHover,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
        style,
      ]}
    >
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ emoji, icon, title, message, buttonLabel, onPress, note }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        {icon ? <Ionicons name={icon} size={26} color={colors.primary} /> : <Text style={styles.emptyEmoji}>{emoji}</Text>}
      </View>
      <Text accessibilityRole="header" style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
      {buttonLabel ? <PrimaryButton label={buttonLabel} onPress={onPress} style={styles.emptyButton} /> : null}
      {note ? <Text style={styles.emptyNote}>{note}</Text> : null}
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
      shadowColor: colors.shadow,
      shadowOpacity: 0.035,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 5 },
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    headerCopy: { flex: 1 },
    headerTitle: { color: colors.text, fontSize: 27, fontWeight: "700", letterSpacing: -0.55 },
    headerSubtitle: { color: colors.textMuted, fontSize: 14, marginTop: 4, lineHeight: 20 },
    themeToggle: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    controlHover: { backgroundColor: colors.surfaceAlt, borderColor: colors.textFaint },
    controlPressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
    sectionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
      marginTop: spacing.xl,
    },
    sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "700", letterSpacing: 0.1 },
    sectionRight: { color: colors.textMuted, fontSize: 12.5, fontWeight: "600" },
    progressTrack: { height: 7, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: radius.pill },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.sm,
    },
    chipHover: { backgroundColor: colors.surfaceAlt, borderColor: colors.textFaint },
    chipText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
    chipTextActive: { color: colors.white },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: radius.md,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarEmoji: { fontSize: 19 },
    button: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: spacing.xl,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
    },
    buttonHover: { backgroundColor: colors.primaryHover },
    buttonPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
    buttonDisabled: { backgroundColor: colors.surfaceAlt },
    buttonText: { color: colors.white, fontSize: 15, fontWeight: "700" },
    buttonTextDisabled: { color: colors.textFaint },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.lg,
    },
    emptyEmoji: { fontSize: 26 },
    emptyTitle: { color: colors.text, fontSize: 20, fontWeight: "700", textAlign: "center" },
    emptyMessage: { color: colors.textMuted, fontSize: 14, textAlign: "center", marginTop: spacing.sm, lineHeight: 21, maxWidth: 440 },
    emptyButton: { marginTop: spacing.lg, minWidth: 170 },
    emptyNote: { color: colors.textFaint, fontSize: 12.5, textAlign: "center", marginTop: spacing.lg, fontWeight: "600" },
    loading: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
    loadingLabel: { color: colors.textMuted, fontSize: 14, marginTop: spacing.md },
  });
