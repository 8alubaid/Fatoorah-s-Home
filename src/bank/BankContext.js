// App-wide bank connection state. Every screen reads transactions/accounts from
// here. The connection now lives SERVER-SIDE, tied to the signed-in user (the
// backend looks it up from the auth token), so it follows the account across
// devices and never leaks between users.
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { bankProvider } from "./index";
import { useAuth } from "../auth/AuthContext";

const BankCtx = createContext(null);

export function BankProvider({ children }) {
  const { session } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | error
  const [restoring, setRestoring] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  const apply = useCallback((r) => {
    const accts = r.accounts || [];
    setAccounts(accts);
    setTransactions(r.transactions || []);
    setLastSynced(Date.now());
    setStatus(accts.length ? "connected" : "idle");
  }, []);

  // Load the signed-in user's connection on login; clear everything on logout.
  useEffect(() => {
    let cancelled = false;
    if (!session) {
      setAccounts([]);
      setTransactions([]);
      setLastSynced(null);
      setStatus("idle");
      setRestoring(false);
      return;
    }
    (async () => {
      setRestoring(true);
      try {
        const r = await bankProvider.fetchData();
        if (!cancelled) apply(r);
      } catch {
        if (!cancelled) setStatus("idle");
      }
      if (!cancelled) setRestoring(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [session, apply]);

  const connect = useCallback(
    async ({ bankId, onProgress, openLinkSDK } = {}) => {
      setStatus("connecting");
      try {
        const result = await bankProvider.connect({ bankId, onProgress, openLinkSDK });
        apply(result);
        return result;
      } catch (e) {
        setStatus("error");
        throw e;
      }
    },
    [apply]
  );

  // Re-fetch the latest data (the "re-sync" button).
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const r = await bankProvider.fetchData();
      apply(r);
    } catch {
      /* keep existing data on a failed refresh */
    } finally {
      setRefreshing(false);
    }
  }, [apply]);

  // Explicitly unlink the bank (server-side). Different from signing out.
  const disconnect = useCallback(async () => {
    try {
      await bankProvider.disconnect?.();
    } catch {
      /* best-effort */
    }
    setAccounts([]);
    setTransactions([]);
    setLastSynced(null);
    setStatus("idle");
  }, []);

  const value = {
    accounts,
    transactions,
    status,
    restoring,
    refreshing,
    lastSynced,
    connected: accounts.length > 0,
    provider: bankProvider,
    connect,
    refresh,
    disconnect,
  };

  return <BankCtx.Provider value={value}>{children}</BankCtx.Provider>;
}

export function useBank() {
  const ctx = useContext(BankCtx);
  if (!ctx) throw new Error("useBank must be used inside <BankProvider>");
  return ctx;
}
