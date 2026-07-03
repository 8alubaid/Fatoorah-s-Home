import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, radius } from "../src/theme";
import { useTheme, useThemedStyles } from "../src/ThemeContext";
import { PrimaryButton } from "../src/components/ui";
import { useAuth } from "../src/auth/AuthContext";
import { Pressable } from "react-native";

export default function Auth() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { signIn, signUp, configured } = useAuth();

  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const submit = async () => {
    setError("");
    setInfo("");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      const fn = mode === "signin" ? signIn : signUp;
      const { data, error: err } = await fn(email, password);
      if (err) {
        setError(err.message);
      } else if (mode === "signup" && !data.session) {
        setInfo("Check your email to confirm your account, then sign in.");
        setMode("signin");
      }
      // On success with a session, the router gate redirects to the app.
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>Fatoorah</Text>
          <Text style={styles.tagline}>Your receipts & spending, in one place.</Text>

          <View style={styles.card}>
            <Text style={styles.title}>{mode === "signin" ? "Welcome back" : "Create your account"}</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textFaint}
              secureTextEntry
              style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {info ? <Text style={styles.info}>{info}</Text> : null}
            {!configured ? (
              <Text style={styles.error}>
                Supabase isn't configured yet — add your Project URL + anon key in
                src/lib/supabaseConfig.js.
              </Text>
            ) : null}

            <PrimaryButton
              label={busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              onPress={submit}
              disabled={busy}
              style={{ marginTop: spacing.lg }}
            />

            <Pressable
              onPress={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError("");
                setInfo("");
              }}
              style={styles.switch}
            >
              <Text style={styles.switchText}>
                {mode === "signin" ? "New here? Create an account" : "Have an account? Sign in"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    scroll: { flexGrow: 1, justifyContent: "center", padding: spacing.xl },
    brand: { color: colors.text, fontSize: 34, fontWeight: "800", textAlign: "center", letterSpacing: -0.5 },
    tagline: { color: colors.textMuted, fontSize: 14, textAlign: "center", marginTop: 6, marginBottom: spacing.xl },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
    },
    title: { color: colors.text, fontSize: 20, fontWeight: "800", marginBottom: spacing.lg },
    label: { color: colors.textMuted, fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: spacing.sm },
    input: {
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      height: 48,
      color: colors.text,
      fontSize: 15,
      outlineStyle: "none",
    },
    error: { color: colors.danger, fontSize: 13, marginTop: spacing.md, lineHeight: 18 },
    info: { color: colors.success, fontSize: 13, marginTop: spacing.md, lineHeight: 18 },
    switch: { alignItems: "center", marginTop: spacing.lg },
    switchText: { color: colors.primary, fontSize: 14, fontWeight: "600" },
  });
