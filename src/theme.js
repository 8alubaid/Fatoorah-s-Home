// Design tokens. Colors are split into light + dark palettes (see getColors).
// Use them via useTheme()/useThemedStyles in src/ThemeContext.js — don't import
// a palette statically, or it won't react to light/dark switches.

// Dark palette — matches the dark app icon (near-black, green accent).
export const darkColors = {
  bg: "#0B0B0C",
  surface: "#161618",
  surfaceAlt: "#212124",
  border: "#2A2A2E",
  text: "#F5F5F7",
  textMuted: "#9A9AA2",
  textFaint: "#6B6B73",
  primary: "#34C759",
  primarySoft: "#13281B",
  success: "#34C759",
  warning: "#FBBF24",
  danger: "#FF6B6B",
  white: "#FFFFFF",
  onPrimary: "#FFFFFF",
  onPrimaryMuted: "#DDF3E4",
  onPrimaryDivider: "rgba(255,255,255,0.25)",
  tabBar: "rgba(26,26,29,0.86)", // translucent pill (floating tab bar)
  tabBarActiveBg: "rgba(52,199,89,0.16)", // active item highlight
};

// Light palette — matches the light app icon (off-white, deeper green accent).
export const lightColors = {
  bg: "#F4F5F7",
  surface: "#FFFFFF",
  surfaceAlt: "#ECEDF1",
  border: "#E3E4E9",
  text: "#16181D",
  textMuted: "#5E626B",
  textFaint: "#9A9DA6",
  primary: "#2E9E63",
  primarySoft: "#E7F6EE",
  success: "#2E9E63",
  warning: "#C77D08",
  danger: "#E5484D",
  white: "#FFFFFF",
  onPrimary: "#FFFFFF",
  onPrimaryMuted: "#E3F5EA",
  onPrimaryDivider: "rgba(255,255,255,0.30)",
  tabBar: "rgba(255,255,255,0.92)", // translucent pill (floating tab bar)
  tabBarActiveBg: "rgba(46,158,99,0.14)", // active item highlight
};

export const getColors = (scheme) => (scheme === "light" ? lightColors : darkColors);

// Vertical space screens leave at the bottom so content clears the floating tab bar.
export const TAB_BAR_SPACE = 104;

// Per-category color + emoji (theme-independent — readable on both palettes).
export const categoryMeta = {
  Food: { color: "#34C759", emoji: "🍔" },
  Shopping: { color: "#A78BFA", emoji: "🛍️" },
  Transport: { color: "#60A5FA", emoji: "🚗" },
  Bills: { color: "#FBBF24", emoji: "💡" },
  Groceries: { color: "#F472B6", emoji: "🛒" },
  Entertainment: { color: "#22D3EE", emoji: "🎬" },
  Health: { color: "#FB7185", emoji: "💊" },
  Other: { color: "#94A3B8", emoji: "📦" },
};

export const categoryColor = (c) =>
  (categoryMeta[c] && categoryMeta[c].color) || categoryMeta.Other.color;
export const categoryEmoji = (c) =>
  (categoryMeta[c] && categoryMeta[c].emoji) || categoryMeta.Other.emoji;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };

export const CURRENCY = "SAR";
