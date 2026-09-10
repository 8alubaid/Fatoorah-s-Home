// Layout facts that depend on the live viewport, shared by the tab navigator and
// the screens so they can never disagree about whether the bottom pill exists.
import { Platform, useWindowDimensions } from "react-native";
import { SIDEBAR_MIN_WIDTH, TAB_BAR_SPACE, spacing } from "./theme";

// Web shows the sidebar only when there's room; otherwise it falls back to the
// same floating pill native uses.
export function useShowSidebar() {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= SIDEBAR_MIN_WIDTH;
}

// Bottom padding a scrollable screen must reserve so the floating pill never
// covers its last rows. With a sidebar there's no bottom bar, so it's just
// breathing room.
export function useBottomSpace() {
  return useShowSidebar() ? spacing.xxl : TAB_BAR_SPACE;
}
