import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Platform, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { spacing, radius, categoryColor, categoryIcon, CONTENT_MAX, CURRENCY } from "../../src/theme";
import { useTheme, useThemedStyles } from "../../src/ThemeContext";
import { Card, ScreenHeader, SectionTitle, ProgressBar, Avatar, EmptyState, ScreenLoading } from "../../src/components/ui";

const isWeb = Platform.OS === "web";
import {
  totalForMonth,
  totalForWeek,
  categoryTotals,
  recentTransactions,
  latestTxDate,
} from "../../src/data";
import { money, shortDate, monthLabel, timeAgo, TODAY } from "../../src/utils";
import { useBank } from "../../src/bank/BankContext";
import { useBottomSpace } from "../../src/useLayout";
import { useBudget } from "../../src/settings/BudgetContext";
import Money from "../../src/components/Money";


export default function Dashboard() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const bottomSpace = useBottomSpace();
  const { budget, setBudget, saving } = useBudget();
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState("");
  const [budgetError, setBudgetError] = useState("");
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
        <ScreenHeader title="Overview" subtitle={monthLabel(TODAY)} />
        <EmptyState
          icon="document-text-outline"
          title="Add your transactions"
          message="Upload a bank statement (PDF) and Fatoorah reads and categorizes every transaction for you — then tracks your spending automatically."
          buttonLabel="Upload statement"
          onPress={() => router.push("/import")}
          note="Secure automatic bank sync is coming soon"
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
    (month <= budget
      ? `You are ${money(budget - month)} under your ${money(budget)} monthly budget.`
      : `You are ${money(month - budget)} over your monthly budget.`);

  const startEditBudget = () => {
    setBudgetDraft(String(budget));
    setBudgetError("");
    setEditingBudget(true);
  };
  const cancelBudget = () => {
    setEditingBudget(false);
    setBudgetError("");
  };
  const saveBudget = async () => {
    const { error } = await setBudget(budgetDraft);
    if (error) return setBudgetError(error.message || "Couldn't save your budget.");
    setEditingBudget(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomSpace }]} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Overview" subtitle={`Financial activity for ${monthLabel(ref)}`} />

        {/* Hero: month + week totals */}
        <Card style={styles.hero}>
          <Text style={styles.heroLabel}>Spent this month</Text>
          <Money amount={month} style={styles.heroAmount} />
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroSmallLabel}>This week</Text>
              <Money amount={week} style={styles.heroSmallValue} />
            </View>
            <View style={styles.heroDivider} />
            <View>
              <Text style={styles.heroSmallLabel}>Transactions</Text>
              <Text style={styles.heroSmallValue}>{transactions.length}</Text>
            </View>
          </View>
        </Card>

        {/* Accounts (demo/bank) OR imported-statement summary */}
        <SectionTitle right={lastSynced ? `Synced ${timeAgo(lastSynced)}` : undefined}>
          {accounts.length > 0 ? "Linked accounts" : "Your transactions"}
        </SectionTitle>
        <Card style={{ paddingVertical: spacing.xs }}>
          {accounts.length > 0 ? (
            accounts.map((a, i) => (
              <View key={a.id} style={[styles.acctRow, i < accounts.length - 1 && styles.divider]}>
                <Avatar icon="business-outline" color={colors.primary} label="Bank account" />
                <View style={styles.acctMid}>
                  <Text style={styles.acctName}>{a.name}</Text>
                  <Text style={styles.acctSub}>{a.bankName} · {a.mask}</Text>
                </View>
                <Money amount={a.balance} style={[styles.acctBalance, a.balance < 0 && { color: colors.danger }]} />
              </View>
            ))
          ) : (
            <View style={styles.acctRow}>
              <Avatar icon="document-text-outline" color={colors.primary} label="Imported statement" />
              <View style={styles.acctMid}>
                <Text style={styles.acctName}>{transactions.length} transactions imported</Text>
                <Text style={styles.acctSub}>From your uploaded statements</Text>
              </View>
            </View>
          )}
          <View style={styles.acctActions}>
            {accounts.length > 0 ? (
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
            ) : (
              <Pressable onPress={() => router.push("/import")} style={styles.acctAction}>
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text style={[styles.acctActionText, { color: colors.primary }]}>Add statement</Text>
              </Pressable>
            )}
            <View style={styles.acctActionDivider} />
            <Pressable onPress={disconnect} style={styles.acctAction}>
              <Ionicons name={accounts.length > 0 ? "unlink" : "trash-outline"} size={16} color={colors.danger} />
              <Text style={[styles.acctActionText, { color: colors.danger }]}>
                {accounts.length > 0 ? "Disconnect" : "Clear"}
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Automated summary */}
        <SectionTitle>Spending summary</SectionTitle>
        <Card style={styles.aiCard}>
          <Text style={styles.aiText}>{summary}</Text>
        </Card>

        {/* Budget progress */}
        <SectionTitle right={`${Math.round((month / budget) * 100)}%`}>
          Budget progress
        </SectionTitle>
        <Card>
          {editingBudget ? (
            <View style={styles.budgetEdit}>
              <Text style={styles.budgetEditLabel}>Monthly budget</Text>
              <View style={styles.budgetInputRow}>
                <Text style={styles.budgetCurrency}>{CURRENCY}</Text>
                <TextInput
                  value={budgetDraft}
                  onChangeText={(t) => {
                    setBudgetDraft(t.replace(/[^0-9]/g, ""));
                    setBudgetError("");
                  }}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  placeholder="4000"
                  placeholderTextColor={colors.textFaint}
                  autoFocus
                  onSubmitEditing={saveBudget}
                  style={styles.budgetInput}
                />
              </View>
              {budgetError ? <Text style={styles.budgetError}>{budgetError}</Text> : null}
              <View style={styles.budgetActions}>
                <Pressable onPress={cancelBudget} style={styles.budgetBtn}>
                  <Text style={styles.budgetBtnText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={saveBudget} disabled={saving} style={[styles.budgetBtn, styles.budgetBtnPrimary]}>
                  <Text style={styles.budgetBtnPrimaryText}>{saving ? "Saving…" : "Save"}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={startEditBudget}
              accessibilityLabel={`Monthly budget ${money(budget)}. Tap to change.`}
              style={({ hovered }) => [styles.budgetRow, hovered && styles.budgetRowHover]}
            >
              <Money amount={month} style={styles.budgetSpent} />
              <Text style={styles.budgetMax}>of</Text>
              <Money amount={budget} style={styles.budgetMaxValue} />
              <View style={styles.budgetEditHint}>
                <Ionicons name="pencil" size={13} color={colors.primary} />
                <Text style={styles.budgetEditHintText}>Edit</Text>
              </View>
            </Pressable>
          )}
          <ProgressBar
            value={month}
            max={budget}
            color={month > budget ? colors.danger : colors.success}
          />
          {topThree.map((c) => (
            <View key={c.category} style={styles.catLine}>
              <View style={[styles.dot, { backgroundColor: categoryColor(c.category) }]} />
              <Text style={styles.catName}>{c.category}</Text>
              <Money amount={c.amount} style={styles.catAmount} />
            </View>
          ))}
        </Card>

        {/* Recent transactions */}
        <SectionTitle>Recent receipts</SectionTitle>
        <Card style={{ paddingVertical: spacing.xs }}>
          {recent.map((r, i) => (
            <View key={r.id} style={[styles.receiptRow, i < recent.length - 1 && styles.divider]}>
              <Avatar icon={categoryIcon(r.category)} color={categoryColor(r.category)} label={r.category} />
              <View style={styles.receiptMid}>
                <Text style={styles.receiptName}>{r.merchant}</Text>
                <Text style={styles.receiptSub}>
                  {r.category} · {shortDate(r.date)}
                </Text>
              </View>
              <Money amount={r.amount} style={styles.receiptAmount} />
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
    scroll: {
      paddingHorizontal: spacing.lg,
      ...(isWeb && { maxWidth: CONTENT_MAX, width: "100%", alignSelf: "center", paddingTop: spacing.md }),
    },
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
    budgetRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: spacing.md,
      marginHorizontal: -spacing.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.sm,
      cursor: "pointer",
    },
    budgetRowHover: { backgroundColor: colors.surfaceAlt },
    budgetEditHint: { flexDirection: "row", alignItems: "center", gap: 4, marginLeft: "auto", marginBottom: 3 },
    budgetEditHintText: { color: colors.primary, fontSize: 13, fontWeight: "700" },
    budgetEdit: { marginBottom: spacing.md },
    budgetEditLabel: { color: colors.textMuted, fontSize: 13, fontWeight: "600", marginBottom: 6 },
    budgetInputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      height: 48,
    },
    budgetCurrency: { color: colors.textMuted, fontSize: 15, fontWeight: "700" },
    budgetInput: { flex: 1, color: colors.text, fontSize: 18, fontWeight: "700", height: "100%", outlineStyle: "none" },
    budgetError: { color: colors.danger, fontSize: 12.5, marginTop: 6 },
    budgetActions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm, marginTop: spacing.md },
    budgetBtn: { paddingVertical: 9, paddingHorizontal: spacing.lg, borderRadius: radius.md, cursor: "pointer" },
    budgetBtnText: { color: colors.textMuted, fontSize: 14, fontWeight: "700" },
    budgetBtnPrimary: { backgroundColor: colors.primary },
    budgetBtnPrimaryText: { color: colors.onPrimary, fontSize: 14, fontWeight: "700" },
    budgetSpent: { color: colors.text, fontSize: 22, fontWeight: "800" },
    budgetMax: { color: colors.textMuted, fontSize: 14, marginLeft: 6, marginBottom: 2 },
    budgetMaxValue: { color: colors.textMuted, fontSize: 14, marginLeft: 4, marginBottom: 2 },
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
