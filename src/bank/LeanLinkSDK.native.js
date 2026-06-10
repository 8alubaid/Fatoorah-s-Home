// Native wrapper around lean-react-native's <LinkSDK>. Loaded only on iOS/Android
// (Metro picks this over the .web.js stub). The require is guarded so the app
// still runs if the SDK/native webview isn't present (e.g. plain Expo Go).
import React, { forwardRef } from "react";

let RealLinkSDK = null;
try {
  // eslint-disable-next-line global-require
  RealLinkSDK = require("lean-react-native").default;
} catch (e) {
  RealLinkSDK = null;
}

export const LEAN_AVAILABLE = !!RealLinkSDK;

export const LeanLink = forwardRef(function LeanLink(props, ref) {
  if (!RealLinkSDK) return null;
  return <RealLinkSDK ref={ref} {...props} />;
});

export default LeanLink;
