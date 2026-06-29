// App-wide bank connection state. Every screen reads transactions/accounts from
// here, so the data source (mock or Lean) is invisible to the UI. The connection
// (customerId + entityId) is persisted in secure storage and re-fetched on
// launch, so the user doesn't re-link every time they open the app.
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { bankProvider } from "./index";
import { loadConnection, saveConnection, clearConnection } from "./storage";

const BankCtx = createContext(null);

export function BankProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | error
  const [restoring, setRestoring] = useState(true); // restoring a saved connection on launch
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const conn = useRef(null); // { customerId, entityId }

  const apply = useCallback(async (r) => {
    setAccounts(r.accounts || []);
    setTransactions(r.transactions || []);
    conn.current = { customerId: r.customerId, entityId: r.entityId };
    await saveConnection(conn.current);
    setLastSynced(Date.now());
    setStatus("connected");
  }, []);

  // Restore a saved connection on launch and re-fetch its data.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await loadConnection();
      if (saved?.customerId) {
        conn.current = saved;
        setStatus("connecting");
        try {
          const r = await bankProvider.fetchData(saved);
          if (!cancelled) await apply(r);
        } catch {
          if (!cancelled) setStatus("error"); // keep conn so the user can retry
        }
      }
      if (!cancelled) setRestoring(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const connect = useCallback(
    async ({ bankId, onProgress, openLinkSDK } = {}) => {
      setStatus("connecting");
      try {
        const result = await bankProvider.connect({ bankId, onProgress, openLinkSDK });
        await apply(result);
        return result;
      } catch (e) {
        setStatus("error");
        throw e;
      }
    },
    [apply]
  );

  // Re-fetch the latest data for the saved connection (the "re-sync" button).
  const refresh = useCallback(async () => {
    if (!conn.current?.customerId) return;
    setRefreshing(true);
    try {
      const r = await bankProvider.fetchData(conn.current);
      await apply(r);
    } catch {
      /* keep existing data on a failed refresh */
    } finally {
      setRefreshing(false);
    }
  }, [apply]);

  const disconnect = useCallback(async () => {
    conn.current = null;
    setAccounts([]);
    setTransactions([]);
    setLastSynced(null);
    setStatus("idle");
    await clearConnection();
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
