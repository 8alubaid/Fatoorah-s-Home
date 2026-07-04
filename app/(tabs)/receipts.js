import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { spacing, radius, categoryColor, categoryEmoji, TAB_BAR_SPACE } from "../../src/theme";
import { useTheme, useThemedStyles } from "../../src/ThemeContext";
import { ScreenHeader, Chip, Avatar, EmptyState, ScreenLoading } from "../../src/components/ui";
import { sortedTransactions, allCategories, parseDate } from "../../src/data";
import { money, shortDate, TODAY } from "../../src/utils";
import { useBank } from "../../src/bank/BankContext";

const DATE_FILTERS = [
  { key: "all", label: "All time" },
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
];

export default function Receipts() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { connected, transactions, restoring } = useBank();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");

  const categories = ["All", ...allCategories(transactions)];

  const filtered = useMemo(() => {
    return sortedTransactions(transactions).filter((r) => {
      if (category !== "All" && r.category !== category) return false;
      if (query && !`${r.merchant} ${r.category} ${r.note}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (dateFilter !== "all") {
        const days = Number(dateFilter);
        const cutoff = new Date(TODAY);
        cutoff.setDate(TODAY.getDate() - days);
        if (parseDate(r.date) < cutoff) return false;
      }
      return true;
    });
  }, [transactions, query, category, dateFilter]);

  const total = filtered.reduce((s, r) => s + r.amount, 0);

  if (restoring) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader title="Receipts 🧾" />
        <ScreenLoading label="Loading your receipts…" />
      </SafeAreaView>
    );
  }

  if (!connected) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader title="Receipts 🧾" />
        <EmptyState
          emoji="🧾"
          title="No receipts yet"
          message="Connect your bank and your transactions will appear here automatically — searchable and filterable by category and date."
          buttonLabel="Connect bank"
          onPress={() => router.push("/connect")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Receipts 🧾" subtitle={`${filtered.length} receipts · ${money(total)}`} />

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search merchant, category…"
          placeholderTextColor={colors.textFaint}
          style={styles.searchInput}
        />
        {query ? (
          <Ionicons name="close-circle" size={18} color={colors.textFaint} onPress={() => setQuery("")} />
        ) : null}
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipBar} contentContainerStyle={styles.chipRow}>
        {categories.map((c) => (
          <Chip
            key={c}
            label={c}
            active={category === c}
            color={c === "All" ? colors.primary : categoryColor(c)}
            onPress={() => setCategory(c)}
          />
        ))}
      </ScrollView>

      {/* Date filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipBar} contentContainerStyle={styles.chipRow}>
        {DATE_FILTERS.map((d) => (
          <Chip key={d.key} label={d.label} active={dateFilter === d.key} onPress={() => setDateFilter(d.key)} />
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        style={styles.listFill}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No receipts match your filters.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Avatar emoji={categoryEmoji(item.category)} color={categoryColor(item.category)} />
            <View style={styles.mid}>
              <Text style={styles.name}>{item.merchant}</Text>
              <Text style={styles.sub}>
                {item.category} · {shortDate(item.date)}
              </Text>
              {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
            </View>
            <Text style={styles.amount}>{money(item.amount)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      marginHorizontal: spacing.lg,
      height: 46,
    },
    searchInput: { flex: 1, color: colors.text, marginLeft: spacing.sm, fontSize: 15, outlineStyle: "none" },
    // flexGrow:0 keeps the horizontal filter rows from stretching vertically
    // into empty space; alignItems:center keeps each chip at its natural height.
    chipBar: { flexGrow: 0, flexShrink: 0 },
    chipRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, alignItems: "center" },
    listFill: { flex: 1 }, // claim the remaining space so the chips can't grow into it
    list: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: TAB_BAR_SPACE, flexGrow: 1 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    mid: { flex: 1, marginLeft: spacing.md },
    name: { color: colors.text, fontSize: 15, fontWeight: "700" },
    sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    note: { color: colors.textFaint, fontSize: 12, marginTop: 2, fontStyle: "italic" },
    amount: { color: colors.text, fontSize: 16, fontWeight: "700" },
    emptyText: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xxl },
  });
