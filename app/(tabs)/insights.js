import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { spacing, radius, categoryColor, categoryEmoji } from "../../src/theme";
import { useTheme, useThemedStyles } from "../../src/ThemeContext";
import { Card, ScreenHeader, SectionTitle, EmptyState, ScreenLoading } from "../../src/components/ui";
import { categoryTotals, totalForMonth, dailyTotals, latestTxDate } from "../../src/data";
import { money, monthLabel, TODAY } from "../../src/utils";
import { useBank } from "../../src/bank/BankContext";

const MAX_MONTHS_BACK = 3;

// Weekly buckets (W1..W5) from this month's daily totals — keeps bars readable.
function weeklyBuckets(daily) {
  const buckets = [0, 0, 0, 0, 0];
  Object.entries(daily).forEach(([day, amt]) => {
    const idx = Math.min(4, Math.floor((Number(day) - 1) / 7));
    buckets[idx] += amt;
  });
  return buckets;
}

// Day range for a week bucket within `ref`'s month, e.g. "7/1–7", "7/8–14".
function weekLabel(ref, index) {
  const m = ref.getMonth() + 1;
  const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  const start = index * 7 + 1;
  if (start > daysInMonth) return "";
  const end = Math.min(start + 6, daysInMonth);
  return `${m}/${start}–${end}`;
}

export default function Insights() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { connected, transactions, restoring } = useBank();
  const [monthsBack, setMonthsBack] = useState(0);

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

  // Base = latest transaction month; navigate back up to 3 months.
  const base = latestTxDate(transactions) || TODAY;
  const ref = new Date(base.getFullYear(), base.getMonth() - monthsBack, 1);
  const lastMonthRef = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
  const cats = categoryTotals(transactions, ref);
  const month = totalForMonth(transactions, ref);
  const lastMonth = totalForMonth(transactions, lastMonthRef);
  const daily = dailyTotals(transactions, ref);
  const weeks = weeklyBuckets(daily);
  const maxWeek = Math.max(...weeks, 1);

  const diff = month - lastMonth;
  const trendUp = diff >= 0;
  const pctChange = lastMonth > 0 ? Math.round((diff / lastMonth) * 100) : 0;

  const canGoBack = monthsBack < MAX_MONTHS_BACK;
  const canGoForward = monthsBack > 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Insights 📊" />

        {/* Month navigator (back up to 3 months) */}
        <View style={styles.monthNav}>
          <Pressable onPress={() => canGoBack && setMonthsBack(monthsBack + 1)} hitSlop={12} disabled={!canGoBack}>
            <Ionicons name="chevron-back" size={22} color={canGoBack ? colors.primary : colors.textFaint} />
          </Pressable>
          <Text style={styles.monthNavLabel}>{monthLabel(ref)}</Text>
          <Pressable onPress={() => canGoForward && setMonthsBack(monthsBack - 1)} hitSlop={12} disabled={!canGoForward}>
            <Ionicons name="chevron-forward" size={22} color={canGoForward ? colors.primary : colors.textFaint} />
          </Pressable>
        </View>

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
                <Text style={styles.barValue} numberOfLines={1}>
                  {v > 0 ? money(Math.round(v)) : ""}
                </Text>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, { height: `${(v / maxWeek) * 100}%`, backgroundColor: colors.primary }]} />
                </View>
                <Text style={styles.barLabel} numberOfLines={1}>{weekLabel(ref, i)}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Category breakdown — one stacked bar, colored per category */}
        <SectionTitle>Category breakdown</SectionTitle>
        <Card>
          {cats.length === 0 ? (
            <Text style={styles.emptyNote}>No spending in {monthLabel(ref)}.</Text>
          ) : (
            <>
              <View style={styles.stackTrack}>
                {cats.map((c) => (
                  <View
                    key={c.category}
                    style={{ width: `${(c.amount / month) * 100}%`, backgroundColor: categoryColor(c.category) }}
                  />
                ))}
              </View>
              {cats.map((c) => {
                const pct = Math.round((c.amount / month) * 100);
                return (
                  <View key={c.category} style={styles.catRow}>
                    <View style={[styles.catDot, { backgroundColor: categoryColor(c.category) }]} />
                    <Text style={styles.catName}>
                      {categoryEmoji(c.category)} {c.category}
                    </Text>
                    <Text style={styles.catAmount}>
                      {money(c.amount)} <Text style={styles.catPct}>· {pct}%</Text>
                    </Text>
                  </View>
                );
              })}
            </>
          )}
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
    monthNav: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    monthNavLabel: { color: colors.text, fontSize: 15, fontWeight: "700", marginHorizontal: spacing.lg, minWidth: 130, textAlign: "center" },
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
    barChart: { flexDirection: "row", alignItems: "flex-end", height: 190, justifyContent: "space-between" },
    barCol: { flex: 1, alignItems: "center" },
    barTrack: { width: 26, height: 130, justifyContent: "flex-end", borderRadius: radius.sm },
    bar: { width: "100%", borderRadius: radius.sm, minHeight: 4 },
    barValue: { color: colors.textMuted, fontSize: 9.5, fontWeight: "600", marginBottom: 4, height: 14 },
    barLabel: { color: colors.textFaint, fontSize: 10, marginTop: 6 },
    // Single stacked bar segmented by category color.
    stackTrack: {
      flexDirection: "row",
      height: 12,
      borderRadius: radius.pill,
      overflow: "hidden",
      backgroundColor: colors.surfaceAlt,
      marginBottom: spacing.md,
    },
    catRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm },
    catDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
    catName: { color: colors.text, fontSize: 14, fontWeight: "600", flex: 1 },
    catAmount: { color: colors.text, fontSize: 14, fontWeight: "700" },
    catPct: { color: colors.textFaint, fontWeight: "500" },
    emptyNote: { color: colors.textMuted, fontSize: 14, textAlign: "center", paddingVertical: spacing.md },
  });
