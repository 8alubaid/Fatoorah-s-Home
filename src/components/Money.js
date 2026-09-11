// An amount rendered with the Saudi Riyal glyph instead of the "SAR" code.
//
// Designed to drop straight into existing call sites: pass the same text style
// the old <Text>{money(x)}</Text> used and it keeps looking the same. Typography
// props go to the number; everything else (margins, alignment) goes to the row,
// so wrapping the Text in a View doesn't shift the layout.
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Riyal from "./Riyal";
import { useTheme } from "../ThemeContext";
import { amountOnly } from "../utils";

const TYPOGRAPHY = [
  "color",
  "fontSize",
  "fontWeight",
  "fontFamily",
  "fontStyle",
  "letterSpacing",
  "lineHeight",
  "textAlign",
  "textTransform",
];

function split(style) {
  const flat = StyleSheet.flatten(style) || {};
  const text = {};
  const box = {};
  Object.entries(flat).forEach(([k, v]) => {
    (TYPOGRAPHY.includes(k) ? text : box)[k] = v;
  });
  return { text, box, flat };
}

export default function Money({ amount, style, glyphScale = 0.8, numberOfLines }) {
  const { colors } = useTheme();
  const { text, box } = split(style);
  const fontSize = text.fontSize ?? 15;
  const color = text.color ?? colors.text;
  // textAlign can't align a flex row, so translate it to the row's own axis.
  const align =
    text.textAlign === "right" ? "flex-end" : text.textAlign === "center" ? "center" : undefined;

  return (
    <View style={[styles.row, align ? { justifyContent: align } : null, box]}>
      <Riyal size={Math.round(fontSize * glyphScale)} color={color} />
      <Text numberOfLines={numberOfLines} style={[text, styles.number]}>
        {amountOnly(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  // Gap scales visually better than a space character next to a vector glyph.
  number: { marginLeft: 4 },
});
