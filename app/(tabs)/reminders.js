import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { spacing, radius, TAB_BAR_SPACE, CONTENT_MAX } from "../../src/theme";
import { useTheme, useThemedStyles } from "../../src/ThemeContext";
import { Card, ScreenHeader, SectionTitle, Avatar, EmptyState, ScreenLoading } from "../../src/components/ui";
import { reminderMeta, parseDate, detectRecurring, monthlyRecurringTotal, latestTxDate } from "../../src/data";
import { money, monthLabel, relativeDays, TODAY } from "../../src/utils";
import { useBank } from "../../src/bank/BankContext";

const isWeb = Platform.OS === "web";
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const iso = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function Reminders() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { connected, transactions, restoring } = useBank();

  // Anchor to the newest transaction so predictions read sensibly even when the
  // imported statement is a few weeks old.
  const anchor = latestTxDate(transactions) || TODAY;
  const items = useMemo(() => detectRecurring(transactions), [transactions]);
  const monthlyTotal = useMemo(() => monthlyRecurringTotal(items), [items]);

  const [viewRef, setViewRef] = useState(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  const [selected, setSelected] = useState(null);

  const byDate = useMemo(() => {
    const map = {};
    items.forEach((r) => {
      (map[r.date] = map[r.date] || []).push(r);
    });
    return map;
  }, [items]);

  if (restoring) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader title="Reminders ⏰" />
        <ScreenLoading label="Finding your subscriptions…" />
      </SafeAreaView>
    );
  }

  if (!connected) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader title="Reminders ⏰" />
        <EmptyState
          emoji="⏰"
          title="No reminders yet"
          message="Upload a bank statement (PDF) and Fatoorah spots your recurring subscriptions and bills, then reminds you before each one renews."
          buttonLabel="Upload statement"
          onPress={() => router.push("/import")}
          note="🔒 Automatic bank sync — coming soon"
        />
      </SafeAreaView>
    );
  }

  const year = viewRef.getFullYear();
  const monthIdx = viewRef.getMonth();
  const firstWeekday = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const todayIso =
    anchor.getFullYear() === year && anchor.getMonth() === monthIdx
      ? iso(year, monthIdx + 1, anchor.getDate())
      : null;

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(iso(year, monthIdx + 1, d));

  const shiftMonth = (delta) => {
    setSelected(null);
    setViewRef(new Date(year, monthIdx + delta, 1));
  };

  const upcoming = items.filter(
    (r) => parseDate(r.date) >= new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate())
  );
  const listForSelected = selected ? byDate[selected] || [] : upcoming;
  // Only the types we actually derive from spending.
  const legendTypes = ["subscription", "bill"];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Reminders ⏰"
          subtitle={
            items.length
              ? `${items.length} recurring · about ${money(Math.round(monthlyTotal))}/month`
              : "Recurring subscriptions & bills"
          }
        />

        {items.length === 0 ? (
          <Card>
            <Text style={styles.emptyTitle}>No recurring payments found yet</Text>
            <Text style={styles.emptyBody}>
              Fatoorah spots subscriptions and bills by finding the same merchant charging a similar amount on a
              regular schedule. Import another statement or two and they'll show up here.
            </Text>
            <Pressable onPress={() => router.push("/import")} style={styles.emptyBtn}>
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={styles.emptyBtnText}>Add another statement</Text>
            </Pressable>
          </Card>
        ) : (
          <>
            {/* Calendar */}
            <Card>
              <View style={styles.calHeader}>
                <Pressable onPress={() => shiftMonth(-1)} hitSlop={10}>
                  <Text style={styles.calNav}>‹</Text>
                </Pressable>
                <Text style={styles.calTitle}>{monthLabel(viewRef)}</Text>
                <Pressable onPress={() => shiftMonth(1)} hitSlop={10}>
                  <Text style={styles.calNav}>›</Text>
                </Pressable>
              </View>

              <View style={styles.weekRow}>
                {WEEKDAYS.map((w, i) => (
                  <Text key={i} style={styles.weekday}>{w}</Text>
                ))}
              </View>

              <View style={styles.grid}>
                {cells.map((cellIso, i) => {
                  if (!cellIso) return <View key={i} style={styles.cell} />;
                  const day = Number(cellIso.split("-")[2]);
                  const dayItems = byDate[cellIso] || [];
                  const isToday = cellIso === todayIso;
                  const isSelected = cellIso === selected;
                  return (
                    <Pressable key={i} style={styles.cell} onPress={() => setSelected(isSelected ? null : cellIso)}>
                      <View style={[styles.dayCircle, isToday && styles.dayToday, isSelected && styles.daySelected]}>
                        <Text style={[styles.dayNum, (isToday || isSelected) && styles.dayNumActive]}>{day}</Text>
                      </View>
                      <View style={styles.dotRow}>
                        {dayItems.slice(0, 3).map((r, j) => (
                          <View key={j} style={[styles.dot, { backgroundColor: reminderMeta[r.type].color }]} />
                        ))}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.legend}>
                {legendTypes.map((key) => (
                  <View key={key} style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: reminderMeta[key].color }]} />
                    <Text style={styles.legendText}>{reminderMeta[key].label}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <SectionTitle right={selected ? "Showing one day" : undefined}>
              {selected ? `On ${selected.split("-").reverse().slice(0, 2).join("/")}` : "Upcoming"}
            </SectionTitle>

            {listForSelected.length === 0 ? (
              <Card>
                <Text style={styles.empty}>Nothing scheduled for this day.</Text>
              </Card>
            ) : (
              listForSelected.map((r) => {
                const m = reminderMeta[r.type];
                return (
                  <Card key={r.id} style={styles.reminderCard}>
                    <Avatar emoji={m.emoji} color={m.color} />
                    <View style={styles.reminderMid}>
                      <Text style={styles.reminderTitle} numberOfLines={1}>{r.title}</Text>
                      <Text style={styles.reminderSub} numberOfLines={1}>
                        {money(r.amount)} · {r.cadence}
                        {r.seen > 1 ? ` · seen ${r.seen}×` : ""}
                      </Text>
                    </View>
                    <View style={styles.reminderRight}>
                      <View style={[styles.typePill, { backgroundColor: m.color + "22" }]}>
                        <Text style={[styles.typePillText, { color: m.color }]}>{m.label}</Text>
                      </View>
                      <Text style={styles.reminderWhen}>{relativeDays(r.date, anchor)}</Text>
                      {r.confidence === "low" ? <Text style={styles.likely}>likely</Text> : null}
                    </View>
                  </Card>
                );
              })
            )}

            <Text style={styles.footnote}>
              Predicted from your imported transactions — dates are estimates based on past charges.
            </Text>
          </>
        )}

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
      paddingBottom: isWeb ? spacing.xxl : TAB_BAR_SPACE,
      ...(isWeb && { maxWidth: CONTENT_MAX, width: "100%", alignSelf: "center", paddingTop: spacing.md }),
    },
    calHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
    calNav: { color: colors.primary, fontSize: 28, fontWeight: "700", paddingHorizontal: spacing.md },
    calTitle: { color: colors.text, fontSize: 17, fontWeight: "700" },
    weekRow: { flexDirection: "row" },
    weekday: { flex: 1, textAlign: "center", color: colors.textFaint, fontSize: 12, fontWeight: "600" },
    grid: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.sm },
    cell: { width: `${100 / 7}%`, alignItems: "center", paddingVertical: 4 },
    dayCircle: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
    dayToday: { backgroundColor: colors.primary },
    daySelected: { borderWidth: 1.5, borderColor: colors.primary },
    dayNum: { color: colors.text, fontSize: 14, fontWeight: "600" },
    dayNumActive: { color: colors.white, fontWeight: "800" },
    dotRow: { flexDirection: "row", height: 6, marginTop: 3 },
    dot: { width: 5, height: 5, borderRadius: 3, marginHorizontal: 1 },
    legend: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    legendItem: { flexDirection: "row", alignItems: "center", marginRight: spacing.lg, marginBottom: 4 },
    legendText: { color: colors.textMuted, fontSize: 12, marginLeft: 5 },
    empty: { color: colors.textMuted, textAlign: "center" },
    emptyTitle: { color: colors.text, fontSize: 16, fontWeight: "700", textAlign: "center" },
    emptyBody: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: spacing.sm },
    emptyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: spacing.lg },
    emptyBtnText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
    reminderCard: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
    reminderMid: { flex: 1, marginLeft: spacing.md },
    reminderTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
    reminderSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    reminderRight: { alignItems: "flex-end" },
    typePill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill },
    typePillText: { fontSize: 11, fontWeight: "700" },
    reminderWhen: { color: colors.textFaint, fontSize: 12, marginTop: 4 },
    likely: { color: colors.textFaint, fontSize: 10, fontStyle: "italic", marginTop: 1 },
    footnote: { color: colors.textFaint, fontSize: 11.5, textAlign: "center", marginTop: spacing.lg, lineHeight: 16 },
  });
