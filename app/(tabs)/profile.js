import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { spacing, radius, TAB_BAR_SPACE } from "../../src/theme";
import { useTheme, useThemedStyles } from "../../src/ThemeContext";
import { Card, ScreenHeader } from "../../src/components/ui";
import { useAuth } from "../../src/auth/AuthContext";
import { useBank } from "../../src/bank/BankContext";

export default function Profile() {
  const { colors, isDark, toggle } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user, signOut } = useAuth();
  const { connected, accounts } = useBank();
  const [busy, setBusy] = useState(false);

  const email = user?.email || "—";
  const initial = (email[0] || "?").toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const handleSignOut = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Just sign out — the bank connection stays saved server-side and restores
      // on next login. BankContext clears local state when the session ends.
      await signOut();
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Profile 👤" />

        {/* Account */}
        <Card style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.email}>{email}</Text>
          {memberSince ? <Text style={styles.since}>Member since {memberSince}</Text> : null}
        </Card>

        {/* Settings */}
        <Card style={{ paddingVertical: spacing.xs }}>
          <Pressable onPress={toggle} style={styles.row}>
            <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={colors.textMuted} />
            <Text style={styles.rowLabel}>Appearance</Text>
            <Text style={styles.rowValue}>{isDark ? "Dark" : "Light"}</Text>
          </Pressable>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons name="wallet-outline" size={20} color={colors.textMuted} />
            <Text style={styles.rowLabel}>Bank</Text>
            <Text style={styles.rowValue}>
              {connected ? `${accounts.length} account${accounts.length === 1 ? "" : "s"}` : "Not linked"}
            </Text>
          </View>
        </Card>

        {/* Sign out */}
        <Pressable onPress={handleSignOut} disabled={busy} style={styles.signOut}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.signOutText}>{busy ? "Signing out…" : "Sign out"}</Text>
        </Pressable>

        <Text style={styles.footer}>Fatoorah · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    scroll: { paddingHorizontal: spacing.lg, paddingBottom: TAB_BAR_SPACE },
    accountCard: { alignItems: "center", paddingVertical: spacing.xl, marginTop: spacing.sm },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: colors.onPrimary, fontSize: 30, fontWeight: "800" },
    email: { color: colors.text, fontSize: 17, fontWeight: "700", marginTop: spacing.md },
    since: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
    row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md },
    rowLabel: { color: colors.text, fontSize: 15, fontWeight: "500", marginLeft: spacing.md, flex: 1 },
    rowValue: { color: colors.textMuted, fontSize: 14 },
    divider: { height: 1, backgroundColor: colors.border },
    signOut: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingVertical: 14,
      marginTop: spacing.lg,
    },
    signOutText: { color: colors.danger, fontSize: 16, fontWeight: "700", marginLeft: 8 },
    footer: { color: colors.textFaint, fontSize: 12, textAlign: "center", marginTop: spacing.xl },
  });
