// Small persistence layer for the bank connection. We store only the
// identifiers needed to re-fetch (customerId + entityId) in the device's secure
// store — NOT the financial data itself, which is re-fetched from the backend.
// No-ops safely on web (SecureStore is native-only).
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEY = "fatoorah.connection.v1";
const available = Platform.OS !== "web";

export async function saveConnection(conn) {
  if (!available || !conn?.customerId) return;
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(conn));
  } catch {
    /* best-effort */
  }
}

export async function loadConnection() {
  if (!available) return null;
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearConnection() {
  if (!available) return;
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    /* best-effort */
  }
}
