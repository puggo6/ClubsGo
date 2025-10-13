import { COLORS } from "@/constants/theme";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { en, registerTranslation } from "react-native-paper-dates";
registerTranslation("en", en);

export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Redirect href={"/(auth)/login"} />
    </View>
  );
}
