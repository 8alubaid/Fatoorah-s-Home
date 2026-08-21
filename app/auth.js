import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { spacing, radius } from "../src/theme";
import { useTheme, useThemedStyles } from "../src/ThemeContext";
import { PrimaryButton } from "../src/components/ui";
import { useAuth } from "../src/auth/AuthContext";

const LOGO_LIGHT = require("../assets/logo-light.png");
const LOGO_DARK = require("../assets/logo-dark.png");

export default function Auth() {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { signIn, signUp, configured } = useAuth();

  const [mode, setMode] = useState("signin"); // signin | signup
  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Smooth fade + slide of the card each time the mode (sign in ↔ sign up) changes.
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [mode]);
  const cardAnimStyle = {
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  };

  const reset = () => {
    setError("");
    setInfo("");
  };

  const switchMode = () => {
    setMode(isSignup ? "signin" : "signup");
    setPassword("");
    setConfirm("");
    reset();
  };

  const submit = async () => {
    reset();
    // Shared + mode-specific validation.
    if (isSignup && !name.trim()) return setError("Please enter your name.");
    if (!email.trim()) return setError("Please enter your email.");
    if (!password) return setError("Please enter a password.");
    if (isSignup && password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (isSignup && password !== confirm)
      return setError("Passwords don't match.");

    setBusy(true);
    try {
      const { data, error: err } = isSignup
        ? await signUp(email, password, name)
        : await signIn(email, password);
      if (err) {
        setError(err.message);
      } else if (isSignup && !data.session) {
        setInfo("Almost there — check your email to confirm your account, then sign in.");
        setMode("signin");
        setPassword("");
        setConfirm("");
      }
      // On success with a session, the router gate redirects into the app.
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {/* Brand */}
            <View style={[styles.logoTile, { backgroundColor: isDark ? "#0F1013" : "#FFFFFF" }]}>
              <Image source={isDark ? LOGO_DARK : LOGO_LIGHT} style={styles.logoImg} resizeMode="cover" />
            </View>
            <Text style={styles.brand}>Fatoorah</Text>
            <Text style={styles.tagline}>Your receipts & spending, in one place.</Text>

            {/* Card */}
            <Animated.View style={[styles.card, cardAnimStyle]}>
              <Text style={styles.title}>{isSignup ? "Create your account" : "Welcome back"}</Text>
              <Text style={styles.subtitle}>
                {isSignup
                  ? "Track your spending across all your accounts in one app."
                  : "Sign in to pick up where you left off."}
              </Text>

              {/* Name — signup only */}
              {isSignup ? (
                <>
                  <Text style={styles.label}>Full name</Text>
                  <View style={styles.field}>
                    <Ionicons name="person-outline" size={18} color={colors.textFaint} style={styles.fieldIcon} />
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Your name"
                      placeholderTextColor={colors.textFaint}
                      autoCapitalize="words"
                      style={styles.input}
                    />
                  </View>
                </>
              ) : null}

              {/* Email */}
              <Text style={styles.label}>Email</Text>
              <View style={styles.field}>
                <Ionicons name="mail-outline" size={18} color={colors.textFaint} style={styles.fieldIcon} />
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
              </View>

              {/* Password */}
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                {!isSignup ? (
                  <Pressable onPress={() => setInfo("Password reset is coming soon — reach out if you're locked out.")}>
                    <Text style={styles.forgot}>Forgot?</Text>
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.field}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textFaint} style={styles.fieldIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={isSignup ? "At least 8 characters" : "••••••••"}
                  placeholderTextColor={colors.textFaint}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  style={styles.input}
                />
                <Pressable onPress={() => setShowPass((s) => !s)} hitSlop={8}>
                  <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color={colors.textFaint} />
                </Pressable>
              </View>

              {/* Confirm password — signup only */}
              {isSignup ? (
                <>
                  <Text style={styles.label}>Confirm password</Text>
                  <View style={styles.field}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.textFaint} style={styles.fieldIcon} />
                    <TextInput
                      value={confirm}
                      onChangeText={setConfirm}
                      placeholder="Re-enter your password"
                      placeholderTextColor={colors.textFaint}
                      secureTextEntry={!showPass}
                      autoCapitalize="none"
                      style={styles.input}
                    />
                  </View>
                </>
              ) : null}

              {error ? (
                <View style={styles.banner}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.bannerError}>{error}</Text>
                </View>
              ) : null}
              {info ? (
                <View style={styles.banner}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.bannerInfo}>{info}</Text>
                </View>
              ) : null}
              {!configured ? (
                <View style={styles.banner}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.bannerError}>
                    Supabase isn't configured yet — add your Project URL + anon key in src/lib/supabaseConfig.js.
                  </Text>
                </View>
              ) : null}

              <PrimaryButton
                label={busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
                onPress={submit}
                disabled={busy}
                style={{ marginTop: spacing.lg }}
              />

              {isSignup ? (
                <Text style={styles.terms}>
                  By creating an account you agree to our Terms of Service and Privacy Policy.
                </Text>
              ) : null}
            </Animated.View>

            {/* Switch */}
            <View style={styles.switchRow}>
              <Text style={styles.switchMuted}>
                {isSignup ? "Already have an account?" : "New to Fatoorah?"}
              </Text>
              <Pressable onPress={switchMode} hitSlop={8}>
                <Text style={styles.switchLink}>{isSignup ? "Sign in" : "Create an account"}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    scroll: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
    // Keep everything in a phone-width column so it doesn't stretch on desktop web.
    container: { width: "100%", maxWidth: 400, alignSelf: "center" },
    // App-icon tile: matches the logo's own background so the crop blends, with a soft lift.
    logoTile: {
      width: 84,
      height: 84,
      borderRadius: 20,
      alignSelf: "center",
      marginBottom: spacing.md,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    logoImg: { width: "100%", height: "100%" },
    brand: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center", letterSpacing: -0.5 },
    tagline: { color: colors.textMuted, fontSize: 14, textAlign: "center", marginTop: 6, marginBottom: spacing.xl },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 6,
    },
    title: { color: colors.text, fontSize: 22, fontWeight: "800" },
    subtitle: { color: colors.textMuted, fontSize: 13.5, marginTop: 4, marginBottom: spacing.md, lineHeight: 19 },
    labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    label: { color: colors.textMuted, fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: spacing.md },
    forgot: { color: colors.primary, fontSize: 13, fontWeight: "600", marginTop: spacing.md },
    field: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      height: 50,
    },
    fieldIcon: { marginRight: spacing.sm },
    input: { flex: 1, color: colors.text, fontSize: 15, height: "100%", outlineStyle: "none" },
    banner: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      marginTop: spacing.md,
      padding: spacing.sm,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
    },
    bannerError: { color: colors.danger, fontSize: 13, lineHeight: 18, flex: 1 },
    bannerInfo: { color: colors.success, fontSize: 13, lineHeight: 18, flex: 1 },
    terms: { color: colors.textFaint, fontSize: 11.5, textAlign: "center", marginTop: spacing.md, lineHeight: 16 },
    switchRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: spacing.lg },
    switchMuted: { color: colors.textMuted, fontSize: 14 },
    switchLink: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  });
