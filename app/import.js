import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { spacing, radius, CONTENT_MAX } from "../src/theme";
import { useTheme, useThemedStyles } from "../src/ThemeContext";
import { PrimaryButton } from "../src/components/ui";
import { useBank } from "../src/bank/BankContext";
import { uploadStatement } from "../src/statements/statementsApi";
import { money } from "../src/utils";

export default function ImportStatement() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { refresh } = useBank();

  const [step, setStep] = useState("pick"); // pick | working | done | error
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState(null); // { count, transactions, summary }
  const [error, setError] = useState("");

  const pickAndAnalyze = async () => {
    setError("");
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (picked.canceled) return;
      const asset = picked.assets?.[0];
      if (!asset) return;

      setStep("working");
      setProgress("Uploading…");
      const res = await uploadStatement(asset, setProgress);
      setResult(res);
      await refresh(); // pull the freshly-stored transactions into the app
      setStep("done");
    } catch (e) {
      setError(e.message || "Something went wrong analyzing your statement.");
      setStep("error");
    }
  };

  const total = result?.transactions?.reduce((s, t) => s + (t.amount || 0), 0) || 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Import a statement</Text>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.close}>
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === "pick" && (
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="document-text-outline" size={34} color={colors.primary} />
            </View>
            <Text style={styles.title}>Upload your bank statement</Text>
            <Text style={styles.body}>
              Pick a PDF statement from your bank. Fatoorah reads every transaction, categorizes it, and adds it to
              your spending — no bank login needed.
            </Text>
            <PrimaryButton label="Choose PDF file" onPress={pickAndAnalyze} style={{ marginTop: spacing.lg }} />
            <View style={styles.privacyRow}>
              <Ionicons name="lock-closed" size={13} color={colors.textFaint} />
              <Text style={styles.privacy}>Analyzed securely on your server. Only you can see it.</Text>
            </View>
          </View>
        )}

        {step === "working" && (
          <View style={styles.card}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.title}>{progress || "Analyzing…"}</Text>
            <Text style={styles.body}>
              Reading and categorizing your transactions. This can take up to a minute for long statements.
            </Text>
          </View>
        )}

        {step === "done" && (
          <View style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + "22" }]}>
              <Ionicons name="checkmark-circle" size={38} color={colors.primary} />
            </View>
            <Text style={styles.title}>Imported {result?.count ?? result?.transactions?.length ?? 0} transactions</Text>
            <Text style={styles.body}>
              Added {money(total)} of spending to your dashboard, receipts, and insights.
            </Text>
            {result?.summary ? <Text style={styles.summary}>{result.summary}</Text> : null}
            <PrimaryButton label="View my spending" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
            <Pressable onPress={() => setStep("pick")} style={styles.secondary}>
              <Text style={styles.secondaryText}>Import another</Text>
            </Pressable>
          </View>
        )}

        {step === "error" && (
          <View style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: colors.danger + "22" }]}>
              <Ionicons name="alert-circle" size={38} color={colors.danger} />
            </View>
            <Text style={styles.title}>Couldn't import that</Text>
            <Text style={styles.body}>{error}</Text>
            <PrimaryButton label="Try again" onPress={() => setStep("pick")} style={{ marginTop: spacing.lg }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    headerTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
    close: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceAlt,
    },
    scroll: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
    card: {
      width: "100%",
      maxWidth: 440,
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.xl,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    title: { color: colors.text, fontSize: 19, fontWeight: "800", textAlign: "center", marginTop: spacing.sm },
    body: { color: colors.textMuted, fontSize: 14, textAlign: "center", marginTop: spacing.sm, lineHeight: 20 },
    summary: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 21,
      marginTop: spacing.lg,
      backgroundColor: colors.primarySoft,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    privacyRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.lg },
    privacy: { color: colors.textFaint, fontSize: 12 },
    secondary: { marginTop: spacing.md, padding: spacing.sm },
    secondaryText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  });
