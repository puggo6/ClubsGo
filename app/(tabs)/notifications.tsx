import { styles } from "@/styles/auth.styles";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function notifications() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          marginBottom: insets.bottom,
          marginRight: insets.right,
          marginLeft: insets.left,
        },
      ]}
    >
      <Text>notifications</Text>
    </View>
  );
}
