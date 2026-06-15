import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { spacing, radius } from "../src/theme";
import { useTheme, useThemedStyles } from "../src/ThemeContext";
import { Card, PrimaryButton, Avatar } from "../src/components/ui";
import { money } from "../src/utils";
import { useBank } from "../src/bank/BankContext";
import { SAUDI_BANKS } from "../src/bank";
import { LEAN_ENV } from "../src/bank/config";
import { LeanLink, LEAN_AVAILABLE } from "../src/bank/LeanLinkSDK";

export default function Connect() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { connect, provider } = useBank();
  const [step, setStep] = useState("pick"); // pick | consent | connecting | done | error
  const [bank, setBank] = useState(null);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // --- Lean LinkSDK plumbing (only used when BANK_PROVIDER === "lean") ---
  const leanRef = useRef(null);
  const leanPending = useRef(null);
  const [leanSession, setLeanSession] = useState(null); // { appToken, customerId, customerToken, bankId }

  // Injected into the lean provider's connect(). Opens Lean's consent UI and
  // resolves on SUCCESS, rejects on CANCELLED/ERROR.
  const openLinkSDK = (params) =>
    new Promise((resolve, reject) => {
      if (!LEAN_AVAILABLE) {
        reject(new Error("Lean SDK unavailable — run a custom dev build (not Expo Go)."));
        return;
      }
      leanPending.current = { resolve, reject };
      setLeanSession(params); // mounts <LeanLink>; the effect below calls link()
    });

  // Once <LeanLink> is mounted with the app token, trigger the link() flow.
  useEffect(() => {
    if (leanSession && leanRef.current) {
      try {
        // KSA v2 uses connect() with app_token = Application Id (per dashboard).
        leanRef.current.connect({
          app_token: leanSession.appToken,
          access_token: leanSession.customerToken, // customer-scoped token (its aud is the LinkSDK)
          customer_id: leanSession.customerId,
          permissions: ["identity", "accounts", "balance", "transactions"],
          account_type: "PERSONAL", // RN SDK expects the uppercase enum (PERSONAL | BUSINESS)
          fail_redirect_url: "https://docs.leantech.me/v2.0-KSA/page/failed-connection",
          success_redirect_url: "https://docs.leantech.me/v2.0-KSA/page/successful-connection",
        });
      } catch (e) {
        leanPending.current?.reject(e);
        leanPending.current = null;
      }
    }
  }, [leanSession]);

  const onLeanCallback = (resp) => {
    const p = leanPending.current;
    leanPending.current = null;
    setLeanSession(null);
    if (!p) return;
    if (resp?.status === "SUCCESS") p.resolve(resp);
    else if (resp?.status === "CANCELLED") p.reject(new Error("You cancelled the bank connection."));
    else {
      const detail =
        resp?.message ||
        [resp?.status, resp?.secondary_status, resp?.last_api_response].filter(Boolean).join(" · ") ||
        "Bank connection failed.";
      p.reject(new Error(detail));
    }
  };

  const startConnect = async () => {
    setStep("connecting");
    setError("");
    try {
      const res = await connect({ bankId: bank.id, onProgress: setProgress, openLinkSDK });
      setResult(res);
      setStep("done");
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setStep("error");
    }
  };

  const close = () => router.back();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connect a bank</Text>
        <Pressable onPress={close} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Step 1 — pick a bank */}
        {step === "pick" && (
          <>
            <Text style={styles.lead}>Choose your bank to securely import accounts and transactions.</Text>
            {SAUDI_BANKS.map((b) => (
              <Pressable key={b.id} onPress={() => { setBank(b); setStep("consent"); }}>
                <Card style={styles.bankRow}>
                  <Avatar emoji={b.emoji} color={b.color} />
                  <View style={styles.bankMid}>
                    <Text style={styles.bankName}>{b.short}</Text>
                    <Text style={styles.bankSub}>{b.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
                </Card>
              </Pressable>
            ))}
          </>
        )}

        {/* Step 2 — consent */}
        {step === "consent" && bank && (
          <>
            <View style={styles.center}>
              <Avatar emoji={bank.emoji} color={bank.color} />
              <Text style={styles.consentTitle}>{bank.name}</Text>
            </View>
            <Card style={{ marginTop: spacing.lg }}>
              <ConsentLine icon="lock-closed" text="Read-only access — Fatoorah can see balances and transactions, and can never move your money." />
              <ConsentLine icon="shield-checkmark" text="You log in on your bank's secure screen. Your password is never shared with this app." />
              <ConsentLine icon="hand-left" text="You can revoke access any time from this app or your bank." />
              {provider.isMock ? (
                <View style={styles.sandboxNote}>
                  <Text style={styles.sandboxText}>
                    Demo mode — no real bank is contacted. Flip BANK_PROVIDER to "lean" in src/bank/config.js to go live.
                  </Text>
                </View>
              ) : (
                <View style={styles.sandboxNote}>
                  <Text style={styles.sandboxText}>Powered by Lean Technologies · SAMA-regulated Open Banking.</Text>
                </View>
              )}
            </Card>
            <PrimaryButton
              label="Continue to bank login"
              onPress={startConnect}
              style={{ marginTop: spacing.xl }}
            />
            <Pressable onPress={() => setStep("pick")} style={styles.backLink}>
              <Text style={styles.backLinkText}>Choose a different bank</Text>
            </Pressable>
          </>
        )}

        {/* Step 3 — connecting */}
        {step === "connecting" && (
          <View style={styles.centerTall}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.progressText}>{progress || "Connecting…"}</Text>
            <Text style={styles.progressSub}>Keep this screen open.</Text>
          </View>
        )}

        {/* Step 4 — done */}
        {step === "done" && result && (
          <>
            <View style={styles.centerTall}>
              <View style={styles.successBadge}>
                <Ionicons name="checkmark" size={36} color={colors.white} />
              </View>
              <Text style={styles.consentTitle}>Connected!</Text>
              <Text style={styles.progressSub}>
                Imported {result.transactions.length} transactions from {result.accounts.length} account
                {result.accounts.length === 1 ? "" : "s"}.
              </Text>
            </View>
            {result.accounts.map((a) => (
              <Card key={a.id} style={styles.acctRow}>
                <Avatar emoji="🏦" color={colors.primary} />
                <View style={styles.bankMid}>
                  <Text style={styles.bankName}>{a.name}</Text>
                  <Text style={styles.bankSub}>{a.bankName} · {a.mask}</Text>
                </View>
                <Text style={styles.acctBalance}>{money(a.balance)}</Text>
              </Card>
            ))}
            <PrimaryButton label="View my dashboard" onPress={close} style={{ marginTop: spacing.xl }} />
          </>
        )}

        {/* Error */}
        {step === "error" && (
          <View style={styles.centerTall}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.consentTitle}>Couldn't connect</Text>
            <Text style={styles.errorText}>{error}</Text>
            <PrimaryButton label="Try again" onPress={() => setStep("pick")} style={{ marginTop: spacing.xl }} />
          </View>
        )}
      </ScrollView>

      {/* Lean consent host — only on a real device in lean mode. Invisible until link() runs. */}
      {!provider.isMock && LEAN_AVAILABLE && leanSession ? (
        <LeanLink
          ref={leanRef}
          appToken={leanSession.appToken}
          country="sa"
          sandbox={LEAN_ENV === "sandbox"}
          showLogs
          callback={onLeanCallback}
        />
      ) : null}
    </SafeAreaView>
  );
}

function ConsentLine({ icon, text }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.consentLine}>
      <Ionicons name={icon} size={18} color={colors.primary} style={{ marginTop: 2 }} />
      <Text style={styles.consentText}>{text}</Text>
    </View>
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
    paddingVertical: spacing.md,
  },
  headerTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  lead: { color: colors.textMuted, fontSize: 14, marginBottom: spacing.lg, lineHeight: 20 },
  bankRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  bankMid: { flex: 1, marginLeft: spacing.md },
  bankName: { color: colors.text, fontSize: 15, fontWeight: "700" },
  bankSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  center: { alignItems: "center", marginTop: spacing.lg },
  centerTall: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xxl * 1.5 },
  consentTitle: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: spacing.md, textAlign: "center" },
  consentLine: { flexDirection: "row", alignItems: "flex-start", marginBottom: spacing.md },
  consentText: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginLeft: spacing.md, flex: 1 },
  sandboxNote: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  sandboxText: { color: colors.textFaint, fontSize: 12, lineHeight: 18 },
  backLink: { alignItems: "center", marginTop: spacing.lg },
  backLinkText: { color: colors.primary, fontSize: 14, fontWeight: "600" },
  progressText: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: spacing.lg },
  progressSub: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm, textAlign: "center" },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  acctRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  acctBalance: { color: colors.text, fontSize: 15, fontWeight: "700" },
  errorEmoji: { fontSize: 44 },
  errorText: { color: colors.textMuted, fontSize: 14, textAlign: "center", marginTop: spacing.sm, lineHeight: 20 },
});
