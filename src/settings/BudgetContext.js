// The user's monthly spending budget.
//
// Persisted in the Supabase user's `user_metadata` rather than a table: it's a
// single per-user preference, so it syncs across devices and survives reinstall
// without needing a schema migration or a backend endpoint. Demo mode has no
// real account, so there it simply lives in memory for the session.
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";

export const DEFAULT_BUDGET = 4000;
const KEY = "monthly_budget";

const BudgetCtx = createContext(null);

// Accept only a sane positive number; anything else falls back to the default.
const sanitize = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

export function BudgetProvider({ children }) {
  const { user, demo } = useAuth();
  const [budget, setBudgetState] = useState(DEFAULT_BUDGET);
  const [saving, setSaving] = useState(false);

  // Adopt whatever the signed-in account has stored (and reset on sign-out).
  useEffect(() => {
    const stored = sanitize(user?.user_metadata?.[KEY]);
    setBudgetState(stored ?? DEFAULT_BUDGET);
  }, [user]);

  const setBudget = useCallback(
    async (value) => {
      const next = sanitize(value);
      if (!next) return { error: new Error("Enter an amount greater than zero.") };

      const previous = budget;
      setBudgetState(next); // optimistic — the UI shouldn't wait on the network

      if (demo || !user) return {}; // nothing to persist without an account

      setSaving(true);
      try {
        const { error } = await supabase.auth.updateUser({ data: { [KEY]: next } });
        if (error) {
          setBudgetState(previous); // roll back so the UI never lies
          return { error };
        }
        return {};
      } catch (e) {
        setBudgetState(previous);
        return { error: e };
      } finally {
        setSaving(false);
      }
    },
    [budget, demo, user]
  );

  return (
    <BudgetCtx.Provider value={{ budget, setBudget, saving, isDefault: budget === DEFAULT_BUDGET }}>
      {children}
    </BudgetCtx.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetCtx);
  if (!ctx) throw new Error("useBudget must be used inside <BudgetProvider>");
  return ctx;
}
