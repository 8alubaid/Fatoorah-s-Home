import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { spacing, radius, categoryColor, categoryEmoji } from "../../src/theme";
import { useTheme, useThemedStyles } from "../../src/ThemeContext";
import { Card, ScreenHeader, SectionTitle, EmptyState, ScreenLoading } from "../../src/components/ui";
import { categoryTotals, totalForMonth, dailyTotals, latestTxDate } from "../../src/data";
import { money, monthLabel, TODAY } from "../../src/utils";
import { useBank } from "../../src/bank/BankContext";

// Weekly buckets (W1..W5) from this month's daily totals — keeps bars readable.
function weeklyBuckets(daily) {
  const buckets = [0, 0, 0, 0, 0];
  Object.entries(daily).forEach(([day, amt]) => {
    const idx = Math.min(4, Math.floor((Number(day) - 1) / 7));
    buckets[idx] += amt;
  });
  return buckets;
}

export default function Insights() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { connected, transactions, restoring } = useBank();

  if (restoring) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader title="Insights 📊" />
        <ScreenLoading label="Loading your insights…" />
      </SafeAreaView>
    );
  }

  if (!connected) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader title="Insights 📊" />
        <EmptyState
          emoji="📊"
          title="No data to chart yet"
          message="Once your bank is connected, you'll see spending trends, weekly charts, and category breakdowns here."
          buttonLabel="Connect bank"
          onPress={() => router.push("/connect")}
        />
      </SafeAreaView>
    );
  }

  // Anchor to the latest transaction month (sandbox data can be historical).
  const ref = latestTxDate(transactions) || TODAY;
  const lastMonthRef = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
  const cats = categoryTotals(transactions, ref);
  const month = totalForMonth(transactions, ref);
  const lastMonth = totalForMonth(transactions, lastMonthRef);
  const daily = dailyTotals(transactions, ref);
  const weeks = weeklyBuckets(daily);
  const maxWeek = Math.max(...weeks, 1);
  const catMax = cats.length ? cats[0].amount : 1;

  const diff = month - lastMonth;
  const trendUp = diff >= 0;
  const pctChange = lastMonth > 0 ? Math.round((diff / lastMonth) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Insights 📊" subtitle={monthLabel(ref)} />

        {/* Trend vs last month */}
        <Card style={styles.trendCard}>
          <View style={styles.trendRow}>
            <View>
              <Text style={styles.trendLabel}>This month</Text>
              <Text style={styles.trendAmount}>{money(month)}</Text>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: (trendUp ? colors.danger : colors.success) + "22" }]}>
              <Ionicons
                name={trendUp ? "trending-up" : "trending-down"}
                size={16}
                color={trendUp ? colors.danger : colors.success}
              />
              <Text style={[styles.trendPct, { color: trendUp ? colors.danger : colors.success }]}>
                {Math.abs(pctChange)}%
              </Text>
            </View>
          </View>
          <Text style={styles.trendNote}>
            {trendUp ? "Up" : "Down"} {money(Math.abs(diff))} vs last month ({money(lastMonth)})
          </Text>
        </Card>

        {/* Weekly bar chart */}
        <SectionTitle>Spending by week</SectionTitle>
        <Card>
          <View style={styles.barChart}>
            {weeks.map((v, i) => (
              <View key={i} style={styles.barCol}>
                <Text style={styles.barValue}>{v > 0 ? Math.round(v) : ""}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, { height: `${(v / maxWeek) * 100}%`, backgroundColor: colors.primary }]} />
                </View>
                <Text style={styles.barLabel}>W{i + 1}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Category breakdown */}
        <SectionTitle>Category breakdown</SectionTitle>
        <Card>
          {cats.map((c) => {
            const pct = Math.round((c.amount / month) * 100);
            return (
              <View key={c.category} style={styles.catBlock}>
                <View style={styles.catTop}>
                  <Text style={styles.catName}>
                    {categoryEmoji(c.category)} {c.category}
                  </Text>
                  <Text style={styles.catAmount}>
                    {money(c.amount)} <Text style={styles.catPct}>· {pct}%</Text>
                  </Text>
                </View>
                <View style={styles.catTrack}>
                  <View style={[styles.catFill, { width: `${(c.amount / catMax) * 100}%`, backgroundColor: categoryColor(c.category) }]} />
                </View>
              </View>
            );
          })}
        </Card>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    trendCard: { marginTop: spacing.sm },
    trendRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    trendLabel: { color: colors.textMuted, fontSize: 13 },
    trendAmount: { color: colors.text, fontSize: 30, fontWeight: "800", marginTop: 2 },
    trendBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
    },
    trendPct: { fontSize: 14, fontWeight: "700", marginLeft: 4 },
    trendNote: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm },
    barChart: { flexDirection: "row", alignItems: "flex-end", height: 180, justifyContent: "space-between" },
    barCol: { flex: 1, alignItems: "center" },
    barTrack: { width: 26, height: 130, justifyContent: "flex-end", borderRadius: radius.sm },
    bar: { width: "100%", borderRadius: radius.sm, minHeight: 4 },
    barValue: { color: colors.textMuted, fontSize: 11, marginBottom: 4, height: 14 },
    barLabel: { color: colors.textFaint, fontSize: 12, marginTop: 6 },
    catBlock: { marginVertical: spacing.sm },
    catTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    catName: { color: colors.text, fontSize: 14, fontWeight: "600" },
    catAmount: { color: colors.text, fontSize: 14, fontWeight: "700" },
    catPct: { color: colors.textFaint, fontWeight: "500" },
    catTrack: { height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: "hidden" },
    catFill: { height: "100%", borderRadius: radius.pill },
  });
