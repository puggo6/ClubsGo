import { COLORS } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type defProps = {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
  restricted?: boolean;
};
type sizeProps = {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
  width: number;
  height: number;
  horizontalPadding?: number;
  restricted?: boolean;
};

export default function GradientButton({
  onPress,
  title,
  disabled = false,
  restricted,
}: defProps) {
  return (
    <View style={styles.outerButton}>
      <LinearGradient
        colors={
          restricted
            ? ["#4B4B4B", "#7C7C7C"]
            : ["#f64f59", "#c471ed", "#12c2e9"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientBorder, disabled && styles.disabledBorder]}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Text style={styles.text}>{title}</Text>
        </Pressable>
      </LinearGradient>
      <View style={{ paddingBottom: 60 }} />
    </View>
  );
}

export function MonochromeButton({
  onPress,
  title,
  disabled = false,
  restricted,
}: defProps) {
  return (
    <View style={styles.outerButton}>
      <View
        style={[
          styles.gradientBorder,
          disabled && styles.disabledBorder,
          { backgroundColor: COLORS.textSecondary },
        ]}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Text style={styles.text}>{title}</Text>
        </Pressable>
      </View>
      <View style={{ paddingBottom: 60 }} />
    </View>
  );
}
export function LargeMonochromeButton({
  onPress,
  title,
  disabled = false,
  restricted,
}: defProps) {
  return (
    <View style={{ width: "75%" }}>
      <View
        style={[
          styles.largeBorder,
          disabled && styles.disabledBorder,
          { backgroundColor: COLORS.textSecondary },
        ]}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            disabled && styles.disabled,
            { borderRadius: 100 },
          ]}
        >
          <Text style={styles.text}>{title}</Text>
        </Pressable>
      </View>
      <View style={{ paddingBottom: 60 }} />
    </View>
  );
}
export function SizeGradientButton({
  onPress,
  title,
  width,
  height,
  horizontalPadding,
  disabled = false,
  restricted,
}: sizeProps) {
  return (
    <View
      style={[!horizontalPadding && { paddingHorizontal: horizontalPadding }]}
    >
      <LinearGradient
        colors={
          restricted
            ? ["#4B4B4B", "#7C7C7C"]
            : ["#f64f59", "#c471ed", "#12c2e9"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientBorder, disabled && styles.disabledBorder]}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            disabled && styles.disabled,
            { paddingVertical: height, paddingHorizontal: width },
          ]}
        >
          <Text style={[styles.text]}>{title}</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: 16,
    padding: 2,
    marginVertical: 10,
  },
  largeBorder: {
    borderRadius: 100,
    padding: 2,
    marginVertical: 10,
  },
  button: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  disabledBorder: {
    opacity: 0.3,
  },
  disabled: {
    backgroundColor: "#222222",
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: "InterSemiBold",
  },
  outerButton: {
    paddingHorizontal: 60,
  },
});
