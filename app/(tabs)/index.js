import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { spacing, radius, categoryColor, categoryEmoji, TAB_BAR_SPACE } from "../../src/theme";
import { useTheme, useThemedStyles } from "../../src/ThemeContext";
import { Card, ScreenHeader, SectionTitle, ProgressBar, Avatar, EmptyState, ScreenLoading } from "../../src/components/ui";
import {
  totalForMonth,
  totalForWeek,
  categoryTotals,
  recentTransactions,
  latestTxDate,
} from "../../src/data";
import { money, shortDate, monthLabel, timeAgo, TODAY } from "../../src/utils";
import { useBank } from "../../src/bank/BankContext";

const MONTHLY_BUDGET = 4000;

export default function Dashboard() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { connected, transactions, accounts, disconnect, restoring, refreshing, lastSynced, refresh } = useBank();

  if (restoring) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader title="Fatoorah" subtitle="Restoring your connection…" />
        <ScreenLoading label="Loading your accounts…" />
      </SafeAreaView>
    );
  }

  if (!connected) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader title="Fatoorah" subtitle={`Hello 👋 · ${monthLabel(TODAY)}`} />
        <EmptyState
          emoji="🏦"
          title="Connect your bank"
          message="Link your SNB account to automatically import receipts and track your spending. Your login stays with your bank — Fatoorah only gets read-only access."
          buttonLabel="Connect bank"
          onPress={() => router.push("/connect")}
        />
      </SafeAreaView>
    );
  }

  // Anchor monthly views to the latest transaction (sandbox data can be historical).
  const ref = latestTxDate(transactions) || TODAY;
  const month = totalForMonth(transactions, ref);
  const week = totalForWeek(transactions, ref);
  const cats = categoryTotals(transactions, ref);
  const recent = recentTransactions(transactions, 4);
  const topThree = cats.slice(0, 3);

  const summary =
    `You've spent ${money(month)} in ${monthLabel(ref)}. ` +
    (cats[0]
      ? `${cats[0].category} is your biggest category at ${money(cats[0].amount)}. `
      : "") +
    (month <= MONTHLY_BUDGET
      ? `You're ${money(MONTHLY_BUDGET - month)} under your ${money(MONTHLY_BUDGET)} budget — nice pace. 👍`
      : `You're ${money(month - MONTHLY_BUDGET)} over budget this month. ⚠️`);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Fatoorah" subtitle={`Hello 👋 · ${monthLabel(ref)}`} />

        {/* Hero: month + week totals */}
        <Card style={styles.hero}>
          <Text style={styles.heroLabel}>Spent this month</Text>
          <Text style={styles.heroAmount}>{money(month)}</Text>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroSmallLabel}>This week</Text>
              <Text style={styles.heroSmallValue}>{money(week)}</Text>
            </View>
            <View style={styles.heroDivider} />
            <View>
              <Text style={styles.heroSmallLabel}>Transactions</Text>
              <Text style={styles.heroSmallValue}>{transactions.length}</Text>
            </View>
          </View>
        </Card>

        {/* Linked accounts */}
        <SectionTitle right={lastSynced ? `Synced ${timeAgo(lastSynced)}` : undefined}>
          Linked accounts
        </SectionTitle>
        <Card style={{ paddingVertical: spacing.xs }}>
          {accounts.map((a, i) => (
            <View key={a.id} style={[styles.acctRow, i < accounts.length - 1 && styles.divider]}>
              <Avatar emoji="🏦" color={colors.primary} />
              <View style={styles.acctMid}>
                <Text style={styles.acctName}>{a.name}</Text>
                <Text style={styles.acctSub}>{a.bankName} · {a.mask}</Text>
              </View>
              <Text style={[styles.acctBalance, a.balance < 0 && { color: colors.danger }]}>
                {money(a.balance)}
              </Text>
            </View>
          ))}
          <View style={styles.acctActions}>
            <Pressable onPress={refresh} disabled={refreshing} style={styles.acctAction}>
              {refreshing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="refresh" size={16} color={colors.primary} />
              )}
              <Text style={[styles.acctActionText, { color: colors.primary }]}>
                {refreshing ? "Syncing…" : "Re-sync"}
              </Text>
            </Pressable>
            <View style={styles.acctActionDivider} />
            <Pressable onPress={disconnect} style={styles.acctAction}>
              <Ionicons name="unlink" size={16} color={colors.danger} />
              <Text style={[styles.acctActionText, { color: colors.danger }]}>Disconnect</Text>
            </Pressable>
          </View>
        </Card>

        {/* AI summary */}
        <SectionTitle>AI Summary ✨</SectionTitle>
        <Card style={styles.aiCard}>
          <Text style={styles.aiText}>{summary}</Text>
        </Card>

        {/* Budget progress */}
        <SectionTitle right={`${Math.round((month / MONTHLY_BUDGET) * 100)}%`}>
          Budget progress
        </SectionTitle>
        <Card>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetSpent}>{money(month)}</Text>
            <Text style={styles.budgetMax}>of {money(MONTHLY_BUDGET)}</Text>
          </View>
          <ProgressBar
            value={month}
            max={MONTHLY_BUDGET}
            color={month > MONTHLY_BUDGET ? colors.danger : colors.success}
          />
          {topThree.map((c) => (
            <View key={c.category} style={styles.catLine}>
              <View style={[styles.dot, { backgroundColor: categoryColor(c.category) }]} />
              <Text style={styles.catName}>
                {categoryEmoji(c.category)} {c.category}
              </Text>
              <Text style={styles.catAmount}>{money(c.amount)}</Text>
            </View>
          ))}
        </Card>

        {/* Recent transactions */}
        <SectionTitle>Recent receipts</SectionTitle>
        <Card style={{ paddingVertical: spacing.xs }}>
          {recent.map((r, i) => (
            <View key={r.id} style={[styles.receiptRow, i < recent.length - 1 && styles.divider]}>
              <Avatar emoji={categoryEmoji(r.category)} color={categoryColor(r.category)} />
              <View style={styles.receiptMid}>
                <Text style={styles.receiptName}>{r.merchant}</Text>
                <Text style={styles.receiptSub}>
                  {r.category} · {shortDate(r.date)}
                </Text>
              </View>
              <Text style={styles.receiptAmount}>{money(r.amount)}</Text>
            </View>
          ))}
        </Card>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    scroll: { paddingHorizontal: spacing.lg, paddingBottom: TAB_BAR_SPACE },
    hero: { backgroundColor: colors.primary, borderColor: colors.primary, marginTop: spacing.sm },
    heroLabel: { color: colors.onPrimaryMuted, fontSize: 14, fontWeight: "600" },
    heroAmount: { color: colors.onPrimary, fontSize: 40, fontWeight: "800", marginTop: 4, letterSpacing: -1 },
    heroRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.lg },
    heroDivider: { width: 1, height: 32, backgroundColor: colors.onPrimaryDivider, marginHorizontal: spacing.xl },
    heroSmallLabel: { color: colors.onPrimaryMuted, fontSize: 12 },
    heroSmallValue: { color: colors.onPrimary, fontSize: 18, fontWeight: "700", marginTop: 2 },
    acctRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md },
    acctMid: { flex: 1, marginLeft: spacing.md },
    acctName: { color: colors.text, fontSize: 15, fontWeight: "600" },
    acctSub: { color: colors.textFaint, fontSize: 12, marginTop: 2 },
    acctBalance: { color: colors.text, fontSize: 15, fontWeight: "700" },
    divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
    acctActions: {
      flexDirection: "row",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.xs,
    },
    acctAction: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: spacing.md },
    acctActionText: { fontSize: 13, fontWeight: "600", marginLeft: 6 },
    acctActionDivider: { width: 1, height: 20, backgroundColor: colors.border },
    aiCard: { backgroundColor: colors.primarySoft, borderColor: colors.primary + "55" },
    aiText: { color: colors.text, fontSize: 15, lineHeight: 22 },
    budgetRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: spacing.md },
    budgetSpent: { color: colors.text, fontSize: 22, fontWeight: "800" },
    budgetMax: { color: colors.textMuted, fontSize: 14, marginLeft: 6, marginBottom: 2 },
    catLine: { flexDirection: "row", alignItems: "center", marginTop: spacing.md },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
    catName: { color: colors.textMuted, fontSize: 14, flex: 1 },
    catAmount: { color: colors.text, fontSize: 14, fontWeight: "600" },
    receiptRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md },
    receiptMid: { flex: 1, marginLeft: spacing.md },
    receiptName: { color: colors.text, fontSize: 15, fontWeight: "600" },
    receiptSub: { color: colors.textFaint, fontSize: 12, marginTop: 2 },
    receiptAmount: { color: colors.text, fontSize: 15, fontWeight: "700" },
  });
