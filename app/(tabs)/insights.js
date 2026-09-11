import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { spacing, radius, categoryColor, categoryIcon, paletteColor, CONTENT_MAX } from "../../src/theme";

const isWeb = Platform.OS === "web";
import { useTheme, useThemedStyles } from "../../src/ThemeContext";
import { Card, ScreenHeader, SectionTitle, Avatar, EmptyState, ScreenLoading } from "../../src/components/ui";
import DonutChart from "../../src/components/DonutChart";
import Money from "../../src/components/Money";
import {
  categoryTotals,
  totalForMonth,
  dailyTotals,
  latestTxDate,
  merchantTotals,
  topWithOther,
  monthStats,
  weekRange,
  transactionsForWeek,
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

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "6/1–7" could be read as a date or a fraction, and gave no clue which month
// it belonged to. Naming the month removes both ambiguities: "Jun 1–7".
function weekLabel(ref, index) {
  const range = weekRange(ref, index);
  if (!range) return "";
  return `${MONTH_ABBR[ref.getMonth()]} ${range.start}–${range.end}`;
}

const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

export default function Insights() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const bottomSpace = useBottomSpace();
  const { connected, transactions, restoring } = useBank();
  const [monthsBack, setMonthsBack] = useState(0);
  const [pickedCat, setPickedCat] = useState(null);
  const [pickedMerchant, setPickedMerchant] = useState(null);
  const [pickedWeek, setPickedWeek] = useState(null);

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
  // Clears itself when the category changes and the merchant is no longer present.
  const activeMerchant =
    pickedMerchant && merchants.some((m) => m.merchant === pickedMerchant) ? pickedMerchant : null;
  const toggleMerchant = (key) => setPickedMerchant((prev) => (prev === key ? null : key));

  const weekTxns = pickedWeek === null ? [] : transactionsForWeek(transactions, ref, pickedWeek);

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
              <Money amount={month} style={styles.trendAmount} />
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
                onSelect={setPickedCat}
                centerValue={<Money amount={month} style={styles.donutCenter} />}
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
                      <Money amount={c.amount} style={styles.legendAmount} />
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
                  selectedKey={activeMerchant}
                  onSelect={toggleMerchant}
                  centerValue={
                    <Money
                      amount={activeMerchant ? merchants.find((m) => m.merchant === activeMerchant).amount : activeCatTotal}
                      style={styles.donutCenter}
                    />
                  }
                  centerLabel={activeMerchant || activeCat}
                />
                <View style={styles.legend}>
                  {merchants.map((m, i) => {
                    const isActive = m.merchant === activeMerchant;
                    return (
                      <Pressable
                        key={m.merchant}
                        onPress={() => toggleMerchant(m.merchant)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                        style={({ hovered }) => [
                          styles.legendRow,
                          hovered && styles.legendRowHover,
                          isActive && styles.legendRowActive,
                        ]}
                      >
                        <View style={[styles.legendDot, { backgroundColor: paletteColor(i) }]} />
                        <Text style={[styles.legendName, isActive && styles.legendNameActive]} numberOfLines={1}>
                          {m.merchant}
                        </Text>
                        <Text style={styles.legendPct}>{pct(m.amount, activeCatTotal)}%</Text>
                        <Money amount={m.amount} style={styles.legendAmount} />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </Card>
          </>
        ) : null}

        {/* Weekly bar chart — tap a bar for that week's purchases */}
        <SectionTitle>Spending by week</SectionTitle>
        <Card>
          <View style={styles.barChart}>
            {weeks.map((v, i) => {
              const range = weekRange(ref, i);
              if (!range) return <View key={i} style={styles.barCol} />;
              const isPicked = pickedWeek === i;
              const dimmed = pickedWeek !== null && !isPicked;
              return (
                <Pressable
                  key={i}
                  onPress={() => setPickedWeek(isPicked ? null : i)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isPicked }}
                  accessibilityLabel={`${weekLabel(ref, i)}: ${money(Math.round(v))}. Show purchases.`}
                  style={({ hovered }) => [styles.barCol, hovered && styles.barColHover]}
                >
                  {v > 0 ? (
                    <Money
                      amount={Math.round(v)}
                      style={[styles.barValue, isPicked && styles.barValueActive]}
                      numberOfLines={1}
                    />
                  ) : (
                    <View style={styles.barValueSpacer} />
                  )}
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(v / maxWeek) * 100}%`,
                          backgroundColor: colors.primary,
                          opacity: dimmed ? 0.35 : 1,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, isPicked && styles.barLabelActive]} numberOfLines={1}>
                    {weekLabel(ref, i)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {pickedWeek === null ? (
            <Text style={styles.barHint}>Tap a bar to see that week's purchases</Text>
          ) : null}
        </Card>

        {/* Purchases inside the selected week */}
        {pickedWeek !== null ? (
          <>
            <SectionTitle right={<Money amount={Math.round(weeks[pickedWeek])} style={styles.sectionRightMoney} />}>
              {weekLabel(ref, pickedWeek)}
            </SectionTitle>
            <Card style={{ paddingVertical: spacing.xs }}>
              <View style={styles.weekHead}>
                <Text style={styles.weekCount}>
                  {weekTxns.length === 0
                    ? "No purchases this week"
                    : `${weekTxns.length} purchase${weekTxns.length === 1 ? "" : "s"}`}
                </Text>
                <Pressable onPress={() => setPickedWeek(null)} hitSlop={8} style={styles.weekClose}>
                  <Ionicons name="close" size={16} color={colors.textMuted} />
                  <Text style={styles.weekCloseText}>Close</Text>
                </Pressable>
              </View>
              {weekTxns.map((t, i) => (
                <View key={t.id} style={[styles.weekRow, i < weekTxns.length - 1 && styles.weekDivider]}>
                  <Avatar icon={categoryIcon(t.category)} color={categoryColor(t.category)} label={t.category} />
                  <View style={styles.weekMid}>
                    <Text style={styles.weekMerchant} numberOfLines={1}>{t.merchant}</Text>
                    <Text style={styles.weekSub} numberOfLines={1}>
                      {t.category} · {shortDate(t.date)}
                    </Text>
                  </View>
                  <Money amount={t.amount} style={styles.weekAmount} />
                </View>
              ))}
            </Card>
          </>
        ) : null}

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
                <Money amount={Math.round(stats.perActiveDay)} style={styles.statValue} />
                <Text style={styles.statLabel}>Per spending day</Text>
              </Card>
              <Card style={styles.statCard}>
                <Money amount={stats.biggest.amount} style={styles.statValue} numberOfLines={1} />
                <Text style={styles.statLabel} numberOfLines={1}>
                  Biggest · {stats.biggest.merchant}
                </Text>
                <Text style={styles.statSub}>{shortDate(stats.biggest.date)}</Text>
              </Card>
              <Card style={styles.statCard}>
                <Money amount={stats.topMerchant.amount} style={styles.statValue} numberOfLines={1} />
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
    barCol: { flex: 1, alignItems: "center", cursor: "pointer", paddingTop: 2 },
    barTrack: { width: 26, height: 130, justifyContent: "flex-end", borderRadius: radius.sm },
    bar: { width: "100%", borderRadius: radius.sm, minHeight: 4 },
    barValue: { color: colors.textMuted, fontSize: 10.5, fontWeight: "600", marginBottom: 4, height: 15 },
    barValueSpacer: { height: 15, marginBottom: 4 },
    // Mirrors DonutChart's internal centre style, since passing a node opts
    // out of it.
    donutCenter: { color: colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
    sectionRightMoney: { color: colors.textMuted, fontSize: 12.5, fontWeight: "600" },
    barLabel: { color: colors.textFaint, fontSize: 10.5, marginTop: 6 },
    barLabelActive: { color: colors.primary, fontWeight: "700" },
    barValueActive: { color: colors.text, fontWeight: "700" },
    barColHover: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
    barHint: { color: colors.textFaint, fontSize: 11.5, textAlign: "center", marginTop: spacing.md },
    weekHead: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.sm,
    },
    weekCount: { color: colors.textMuted, fontSize: 12.5, fontWeight: "600" },
    weekClose: { flexDirection: "row", alignItems: "center", gap: 3, cursor: "pointer" },
    weekCloseText: { color: colors.textMuted, fontSize: 12.5, fontWeight: "600" },
    weekRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md },
    weekDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
    weekMid: { flex: 1, marginLeft: spacing.md },
    weekMerchant: { color: colors.text, fontSize: 15, fontWeight: "600" },
    weekSub: { color: colors.textFaint, fontSize: 12, marginTop: 2 },
    weekAmount: { color: colors.text, fontSize: 15, fontWeight: "700" },

    statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    statCard: { flexGrow: 1, flexBasis: 150, minWidth: 150 },
    statValue: { color: colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
    statLabel: { color: colors.textMuted, fontSize: 12.5, marginTop: 3 },
    statSub: { color: colors.textFaint, fontSize: 11, marginTop: 2 },

    emptyNote: { color: colors.textMuted, fontSize: 14, textAlign: "center", paddingVertical: spacing.md },
  });
