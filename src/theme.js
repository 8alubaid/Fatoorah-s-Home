// Semantic design tokens shared by the native and web experiences.
export const darkColors = {
  bg: "#0B1110",
  surface: "#111A18",
  surfaceAlt: "#182321",
  border: "#273431",
  text: "#F3F7F5",
  textMuted: "#A1ADA9",
  textFaint: "#6F7D79",
  primary: "#43B581",
  primaryHover: "#52C28F",
  primarySoft: "#142A22",
  success: "#43B581",
  warning: "#E5A93D",
  danger: "#F07178",
  white: "#FFFFFF",
  onPrimary: "#FFFFFF",
  onPrimaryMuted: "#D8F3E7",
  onPrimaryDivider: "rgba(255,255,255,0.24)",
  tabBar: "rgba(17,26,24,0.94)",
  tabBarActiveBg: "rgba(67,181,129,0.14)",
  shadow: "#000000",
};

export const lightColors = {
  bg: "#F5F7F6",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF2F0",
  border: "#DDE5E1",
  text: "#17211E",
  textMuted: "#5D6B66",
  textFaint: "#899691",
  primary: "#147A52",
  primaryHover: "#0F6845",
  primarySoft: "#E7F3ED",
  success: "#147A52",
  warning: "#A96D12",
  danger: "#C9464D",
  white: "#FFFFFF",
  onPrimary: "#FFFFFF",
  onPrimaryMuted: "#DDF2E8",
  onPrimaryDivider: "rgba(255,255,255,0.28)",
  tabBar: "rgba(255,255,255,0.96)",
  tabBarActiveBg: "rgba(20,122,82,0.10)",
  shadow: "#0B2119",
};

export const getColors = (scheme) => (scheme === "light" ? lightColors : darkColors);

export const TAB_BAR_SPACE = 104;
export const SIDEBAR_WIDTH = 256;
// Below this width the web layout drops the sidebar and shows the floating
// bottom pill instead, so screens must reserve TAB_BAR_SPACE again.
export const SIDEBAR_MIN_WIDTH = 760;
export const CONTENT_MAX = 960;

export const categoryMeta = {
  Food: { color: "#2E8B65", icon: "restaurant-outline", emoji: "🍔" },
  Shopping: { color: "#7A6DB0", icon: "bag-handle-outline", emoji: "🛍️" },
  Transport: { color: "#3979A8", icon: "car-outline", emoji: "🚗" },
  Bills: { color: "#B57A21", icon: "flash-outline", emoji: "💡" },
  Groceries: { color: "#A85E7F", icon: "basket-outline", emoji: "🛒" },
  Entertainment: { color: "#307F8B", icon: "film-outline", emoji: "🎬" },
  Health: { color: "#B85863", icon: "medical-outline", emoji: "💊" },
  Other: { color: "#64748B", icon: "cube-outline", emoji: "📦" },
};

export const categoryColor = (category) =>
  (categoryMeta[category] && categoryMeta[category].color) || categoryMeta.Other.color;
export const categoryIcon = (category) =>
  (categoryMeta[category] && categoryMeta[category].icon) || categoryMeta.Other.icon;
export const categoryEmoji = (category) =>
  (categoryMeta[category] && categoryMeta[category].emoji) || categoryMeta.Other.emoji;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 6, md: 10, lg: 14, pill: 999 };

export const CURRENCY = "SAR";
