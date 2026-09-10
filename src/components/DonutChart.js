// Donut chart built on react-native-svg (works identically on web and native).
//
// Slices are drawn as stroked circles using strokeDasharray/offset rather than
// arc paths — same result, far less trigonometry, and the rounded line caps
// come for free.
import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useTheme, useThemedStyles } from "../ThemeContext";
import { spacing } from "../theme";

// Hoisted so the style object identity stays stable between renders.
const webPointer = { cursor: "pointer" };

export default function DonutChart({
  data = [],
  size = 176,
  thickness = 24,
  centerLabel,
  centerValue,
  selectedKey = null,
  onSelect,
  emptyLabel = "No data",
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // A hairline gap makes adjacent slices readable without a border.
  const gap = data.length > 1 ? Math.min(3, circumference * 0.01) : 0;

  let offset = 0;
  const slices = data.map((d) => {
    const fraction = total > 0 ? d.amount / total : 0;
    const length = Math.max(fraction * circumference - gap, 0);
    const slice = { ...d, length, offset };
    offset += fraction * circumference;
    return slice;
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Start at 12 o'clock instead of 3 o'clock. A plain SVG transform
            string is used rather than the rotation/originX props, which
            react-native-svg's web build emits as an invalid `transform-origin`
            DOM attribute (React warns on every render). */}
        <G transform={`rotate(-90, ${center}, ${center})`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.surfaceAlt}
            strokeWidth={thickness}
            fill="none"
          />
          {total > 0 &&
            slices.map((s) => {
              const dimmed = selectedKey && s.key !== selectedKey;
              return (
                <Circle
                  key={s.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={s.color}
                  strokeWidth={thickness}
                  strokeLinecap="butt"
                  fill="none"
                  opacity={dimmed ? 0.28 : 1}
                  strokeDasharray={`${s.length} ${circumference - s.length}`}
                  strokeDashoffset={-s.offset}
                  // Only the painted dash segment is hit-tested, so each slice
                  // responds just within its own arc. `fill="none"` keeps the
                  // hollow centre from swallowing presses.
                  onPress={onSelect ? () => onSelect(s.key) : undefined}
                  accessibilityRole={onSelect ? "button" : undefined}
                  accessibilityLabel={onSelect ? `${s.label}: ${Math.round((s.amount / total) * 100)}%` : undefined}
                  style={onSelect && Platform.OS === "web" ? webPointer : undefined}
                />
              );
            })}
        </G>
      </Svg>

      <View style={styles.center} pointerEvents="none">
        {total > 0 ? (
          <>
            {centerValue ? <Text style={styles.centerValue}>{centerValue}</Text> : null}
            {centerLabel ? <Text style={styles.centerLabel}>{centerLabel}</Text> : null}
          </>
        ) : (
          <Text style={styles.centerLabel}>{emptyLabel}</Text>
        )}
      </View>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    center: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
    },
    centerValue: { color: colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
    centerLabel: { color: colors.textMuted, fontSize: 11.5, marginTop: 2, textAlign: "center" },
  });
