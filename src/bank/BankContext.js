// App-wide bank connection state. Every screen reads transactions/accounts
// from here, so the data source (mock or Lean) is invisible to the UI.
import React, { createContext, useContext, useState, useCallback } from "react";
import { bankProvider } from "./index";

const BankCtx = createContext(null);

export function BankProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | error

  const connect = useCallback(async ({ bankId, onProgress, openLinkSDK } = {}) => {
    setStatus("connecting");
    try {
      const result = await bankProvider.connect({ bankId, onProgress, openLinkSDK });
      setAccounts(result.accounts || []);
      setTransactions(result.transactions || []);
      setStatus("connected");
      return result;
    } catch (e) {
      setStatus("error");
      throw e;
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccounts([]);
    setTransactions([]);
    setStatus("idle");
  }, []);

  const value = {
    accounts,
    transactions,
    status,
    connected: accounts.length > 0,
    provider: bankProvider,
    connect,
    disconnect,
  };

  return <BankCtx.Provider value={value}>{children}</BankCtx.Provider>;
}

export function useBank() {
  const ctx = useContext(BankCtx);
  if (!ctx) throw new Error("useBank must be used inside <BankProvider>");
  return ctx;
}
