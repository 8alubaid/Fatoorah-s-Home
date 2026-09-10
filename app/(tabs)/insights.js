import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { spacing, radius, categoryColor, categoryIcon, paletteColor, CONTENT_MAX } from "../../src/theme";

const isWeb = Platform.OS === "web";
import { useTheme, useThemedStyles } from "../../src/ThemeContext";
import { Card, ScreenHeader, SectionTitle, EmptyState, ScreenLoading } from "../../src/components/ui";
import DonutChart from "../../src/components/DonutChart";
import {
  categoryTotals,
  totalForMonth,
  dailyTotals,
  latestTxDate,
  merchantTotals,
  topWithOther,
  monthStats,
} from "../../src/data";
import { money, monthLabel, shortDate, TODAY } from "../../src/utils";
import { useBank } from "../../src/bank/BankContext";
import { useBottomSpace } from "../../src/useLayout";

const MAX_MONTHS_BACK = 3;
const MAX_MERCHANT_SLICES = 6;

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

const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

export default function Insights() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const bottomSpace = useBottomSpace();
  const { connected, transactions, restoring } = useBank();
  const [monthsBack, setMonthsBack] = useState(0);
  const [pickedCat, setPickedCat] = useState(null);

  if (restoring) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader title="Insights" />
        <ScreenLoading label="Loading your insights…" />
      </SafeAreaView>
    );
  }

  if (!connected) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader title="Insights" />
        <EmptyState
          icon="analytics-outline"
          title="No data to chart yet"
          message="Upload a bank statement (PDF) and you'll see spending trends, weekly charts, and category breakdowns here."
          buttonLabel="Upload statement"
          onPress={() => router.push("/import")}
          note="Secure automatic bank sync is coming soon"
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
  const stats = monthStats(transactions, ref);

  const diff = month - lastMonth;
  const trendUp = diff >= 0;
  const pctChange = pct(diff, lastMonth);

  const canGoBack = monthsBack < MAX_MONTHS_BACK;
  const canGoForward = monthsBack > 0;

  // The picked category may not exist in the month being viewed — fall back to
  // the biggest one so the drill-down always shows something meaningful.
  const activeCat =
    pickedCat && cats.some((c) => c.category === pickedCat) ? pickedCat : cats[0]?.category ?? null;
  const activeCatTotal = cats.find((c) => c.category === activeCat)?.amount ?? 0;

  const catSlices = cats.map((c) => ({
    key: c.category,
    label: c.category,
    amount: c.amount,
    color: categoryColor(c.category),
  }));

  const merchants = activeCat
    ? topWithOther(merchantTotals(transactions, ref, activeCat), MAX_MERCHANT_SLICES)
    : [];
  const merchantSlices = merchants.map((m, i) => ({
    key: m.merchant,
    label: m.merchant,
    amount: m.amount,
    color: paletteColor(i),
  }));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomSpace }]} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Insights" />

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

        {/* Category donut — tap a row to drill into it below */}
        <SectionTitle>Where your money went</SectionTitle>
        <Card>
          {cats.length === 0 ? (
            <Text style={styles.emptyNote}>No spending in {monthLabel(ref)}.</Text>
          ) : (
            <View style={styles.chartRow}>
              <DonutChart
                data={catSlices}
                selectedKey={activeCat}
                centerValue={money(month)}
                centerLabel={`${cats.length} categories`}
              />
              <View style={styles.legend}>
                {cats.map((c) => {
                  const isActive = c.category === activeCat;
                  return (
                    <Pressable
                      key={c.category}
                      onPress={() => setPickedCat(c.category)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      style={({ hovered }) => [
                        styles.legendRow,
                        hovered && styles.legendRowHover,
                        isActive && styles.legendRowActive,
                      ]}
                    >
                      <View style={[styles.legendDot, { backgroundColor: categoryColor(c.category) }]} />
                      <Text style={[styles.legendName, isActive && styles.legendNameActive]} numberOfLines={1}>
                        {c.category}
                      </Text>
                      <Text style={styles.legendPct}>{pct(c.amount, month)}%</Text>
                      <Text style={styles.legendAmount}>{money(c.amount)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </Card>

        {/* Drill-down: what makes up the selected category */}
        {activeCat && merchantSlices.length > 0 ? (
          <>
            <SectionTitle right={`${pct(activeCatTotal, month)}% of spending`}>
              Inside {activeCat}
            </SectionTitle>
            <Card>
              <View style={styles.drillHead}>
                <Ionicons name={categoryIcon(activeCat)} size={16} color={categoryColor(activeCat)} />
                <Text style={styles.drillHint}>
                  {merchants.length === 1
                    ? `One place accounted for your ${activeCat.toLowerCase()} spending.`
                    : `${merchants.length} places · tap another category above to switch`}
                </Text>
              </View>
              <View style={styles.chartRow}>
                <DonutChart
                  data={merchantSlices}
                  centerValue={money(activeCatTotal)}
                  centerLabel={activeCat}
                />
                <View style={styles.legend}>
                  {merchants.map((m, i) => (
                    <View key={m.merchant} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: paletteColor(i) }]} />
                      <Text style={styles.legendName} numberOfLines={1}>{m.merchant}</Text>
                      <Text style={styles.legendPct}>{pct(m.amount, activeCatTotal)}%</Text>
                      <Text style={styles.legendAmount}>{money(m.amount)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          </>
        ) : null}

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

        {/* Headline numbers */}
        {stats ? (
          <>
            <SectionTitle>At a glance</SectionTitle>
            <View style={styles.statGrid}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{stats.count}</Text>
                <Text style={styles.statLabel}>Transactions</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{money(Math.round(stats.perActiveDay))}</Text>
                <Text style={styles.statLabel}>Per spending day</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue} numberOfLines={1}>{money(stats.biggest.amount)}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>
                  Biggest · {stats.biggest.merchant}
                </Text>
                <Text style={styles.statSub}>{shortDate(stats.biggest.date)}</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue} numberOfLines={1}>{money(stats.topMerchant.amount)}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>
                  Most spent · {stats.topMerchant.merchant}
                </Text>
                <Text style={styles.statSub}>{pct(stats.topMerchant.amount, month)}% of the month</Text>
              </Card>
            </View>
          </>
        ) : null}

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

    // Donut + legend sit side by side when there's room, stack when narrow.
    chartRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: spacing.lg,
      justifyContent: "center",
    },
    legend: { flex: 1, minWidth: 210, gap: 2 },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 7,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.sm,
      gap: spacing.sm,
    },
    legendRowHover: { backgroundColor: colors.surfaceAlt },
    legendRowActive: { backgroundColor: colors.primarySoft },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendName: { color: colors.textMuted, fontSize: 13.5, fontWeight: "600", flex: 1 },
    legendNameActive: { color: colors.text, fontWeight: "700" },
    legendPct: { color: colors.textFaint, fontSize: 12.5, fontWeight: "600", width: 42, textAlign: "right" },
    legendAmount: { color: colors.text, fontSize: 13.5, fontWeight: "700", minWidth: 74, textAlign: "right" },

    drillHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.md },
    drillHint: { color: colors.textMuted, fontSize: 12.5, flex: 1 },

    barChart: { flexDirection: "row", alignItems: "flex-end", height: 190, justifyContent: "space-between" },
    barCol: { flex: 1, alignItems: "center" },
    barTrack: { width: 26, height: 130, justifyContent: "flex-end", borderRadius: radius.sm },
    bar: { width: "100%", borderRadius: radius.sm, minHeight: 4 },
    barValue: { color: colors.textMuted, fontSize: 9.5, fontWeight: "600", marginBottom: 4, height: 14 },
    barLabel: { color: colors.textFaint, fontSize: 10, marginTop: 6 },

    statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    statCard: { flexGrow: 1, flexBasis: 150, minWidth: 150 },
    statValue: { color: colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
    statLabel: { color: colors.textMuted, fontSize: 12.5, marginTop: 3 },
    statSub: { color: colors.textFaint, fontSize: 11, marginTop: 2 },

    emptyNote: { color: colors.textMuted, fontSize: 14, textAlign: "center", paddingVertical: spacing.md },
  });
