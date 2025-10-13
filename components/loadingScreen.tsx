import { COLORS } from "@/constants/theme";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function LoadingScreen() {
  return (
    <View
      style={{
        backgroundColor: COLORS.background,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator color={COLORS.textSecondary} size="large" />
    </View>
  );
}
