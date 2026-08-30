import { COLORS } from "@/constants/theme";
import { ActivityIndicator, View } from "react-native";

export default function SSOCallback() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator color={COLORS.textSecondary} size="large" />
    </View>
  );
}
