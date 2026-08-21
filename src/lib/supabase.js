// Supabase client. Session is persisted in the device's secure store (native)
// so users stay logged in across restarts. Pure JS — no native module beyond
// expo-secure-store, which is already in the build.
import { Platform } from "react-native";
// Native needs a URL polyfill; the browser already has a working `URL`, and
// loading the RN polyfill on web actually breaks it (every new URL() throws).
if (Platform.OS !== "web") {
  require("react-native-url-polyfill/auto");
}
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseConfig";

const SecureStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: Platform.OS === "web" ? undefined : SecureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// The current user's access token — sent to our backend so it knows who's calling.
export async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}
