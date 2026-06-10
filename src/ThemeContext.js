// App-wide light/dark theming. Follows the system scheme by default; the header
// toggle sets a manual override. Screens get colors via useTheme(), and build
// their StyleSheet through useThemedStyles(makeStyles) so colors stay reactive.
import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { getColors } from "./theme";

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [override, setOverride] = useState(null); // null = follow system

  const scheme = override || (system === "light" ? "light" : "dark");
  const colors = useMemo(() => getColors(scheme), [scheme]);

  const value = useMemo(
    () => ({
      colors,
      scheme,
      isDark: scheme === "dark",
      toggle: () => setOverride(scheme === "dark" ? "light" : "dark"),
      setScheme: setOverride, // 'light' | 'dark' | null (null follows system)
    }),
    [colors, scheme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

// Pass a `makeStyles(colors)` factory; returns a memoized StyleSheet for the
// active palette.
export function useThemedStyles(factory) {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
