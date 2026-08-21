// App-wide authentication state (Supabase). Tracks the session so the router
// can gate the app behind login, and exposes sign in / up / out.
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { supabaseConfigured } from "../lib/supabaseConfig";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  // Demo mode: explore the app with mock data, no real account or bank needed.
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    configured: supabaseConfigured,
    demo,
    enterDemo: () => setDemo(true),
    exitDemo: () => setDemo(false),
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email: email.trim(), password }),
    signUp: (email, password, fullName) =>
      supabase.auth.signUp({
        email: email.trim(),
        password,
        options: fullName ? { data: { full_name: fullName.trim() } } : undefined,
      }),
    signOut: () => {
      setDemo(false);
      return supabase.auth.signOut();
    },
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
