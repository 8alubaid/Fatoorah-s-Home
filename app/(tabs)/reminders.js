import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, radius, TAB_BAR_SPACE } from "../../src/theme";
import { useTheme, useThemedStyles } from "../../src/ThemeContext";
import { Card, ScreenHeader, SectionTitle, Avatar } from "../../src/components/ui";
import { reminders, reminderMeta, parseDate } from "../../src/data";
import { money, monthLabel, relativeDays, TODAY } from "../../src/utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function Reminders() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [viewRef, setViewRef] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selected, setSelected] = useState(null);

  const byDate = useMemo(() => {
    const map = {};
    reminders.forEach((r) => {
      (map[r.date] = map[r.date] || []).push(r);
    });
    return map;
  }, []);

  const year = viewRef.getFullYear();
  const monthIdx = viewRef.getMonth();
  const firstWeekday = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const todayIso =
    TODAY.getFullYear() === year && TODAY.getMonth() === monthIdx
      ? `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(TODAY.getDate()).padStart(2, "0")}`
      : null;

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }

  const shiftMonth = (delta) => {
    setSelected(null);
    setViewRef(new Date(year, monthIdx + delta, 1));
  };

  const upcoming = useMemo(
    () =>
      [...reminders]
        .filter((r) => parseDate(r.date) >= new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()))
        .sort((a, b) => parseDate(a.date) - parseDate(b.date)),
    []
  );

  const listForSelected = selected ? byDate[selected] || [] : upcoming;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Reminders ⏰" subtitle="Warranties · returns · renewals · bills" />

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
            {cells.map((iso, i) => {
              if (!iso) return <View key={i} style={styles.cell} />;
              const day = Number(iso.split("-")[2]);
              const dayReminders = byDate[iso] || [];
              const isToday = iso === todayIso;
              const isSelected = iso === selected;
              return (
                <Pressable key={i} style={styles.cell} onPress={() => setSelected(isSelected ? null : iso)}>
                  <View style={[styles.dayCircle, isToday && styles.dayToday, isSelected && styles.daySelected]}>
                    <Text style={[styles.dayNum, (isToday || isSelected) && styles.dayNumActive]}>{day}</Text>
                  </View>
                  <View style={styles.dotRow}>
                    {dayReminders.slice(0, 3).map((r, j) => (
                      <View key={j} style={[styles.dot, { backgroundColor: reminderMeta[r.type].color }]} />
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {Object.entries(reminderMeta).map(([key, m]) => (
              <View key={key} style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: m.color }]} />
                <Text style={styles.legendText}>{m.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <SectionTitle right={selected ? "Clear" : undefined}>
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
                  <Text style={styles.reminderTitle}>{r.title}</Text>
                  <Text style={styles.reminderSub}>{r.merchant} · {money(r.amount)}</Text>
                </View>
                <View style={styles.reminderRight}>
                  <View style={[styles.typePill, { backgroundColor: m.color + "22" }]}>
                    <Text style={[styles.typePillText, { color: m.color }]}>{m.label}</Text>
                  </View>
                  <Text style={styles.reminderWhen}>{relativeDays(r.date)}</Text>
                </View>
              </Card>
            );
          })
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    scroll: { paddingHorizontal: spacing.lg, paddingBottom: TAB_BAR_SPACE },
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
    reminderCard: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
    reminderMid: { flex: 1, marginLeft: spacing.md },
    reminderTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
    reminderSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    reminderRight: { alignItems: "flex-end" },
    typePill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill },
    typePillText: { fontSize: 11, fontWeight: "700" },
    reminderWhen: { color: colors.textFaint, fontSize: 12, marginTop: 4 },
  });
