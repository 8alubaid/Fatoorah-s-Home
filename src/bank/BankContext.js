// App-wide bank connection state. Every screen reads transactions/accounts from
// here. The connection now lives SERVER-SIDE, tied to the signed-in user (the
// backend looks it up from the auth token), so it follows the account across
// devices and never leaks between users.
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { bankProvider } from "./index";
import { SNB_ACCOUNTS, SNB_TRANSACTIONS } from "./snbMockData";
import { useAuth } from "../auth/AuthContext";

const BankCtx = createContext(null);

export function BankProvider({ children }) {
  const { session, demo } = useAuth();
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

  // Demo mode: load mock data immediately, no backend. Real session: fetch the
  // user's connection. Signed out and not demo: clear everything.
  useEffect(() => {
    let cancelled = false;
    if (demo) {
      apply({ accounts: SNB_ACCOUNTS, transactions: SNB_TRANSACTIONS });
      setRestoring(false);
      return;
    }
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
  }, [session, demo, apply]);

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
    if (demo) {
      apply({ accounts: SNB_ACCOUNTS, transactions: SNB_TRANSACTIONS });
      return;
    }
    setRefreshing(true);
    try {
      const r = await bankProvider.fetchData();
      apply(r);
    } catch {
      /* keep existing data on a failed refresh */
    } finally {
      setRefreshing(false);
    }
  }, [apply, demo]);

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
