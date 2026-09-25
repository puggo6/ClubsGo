import { COLORS } from "@/constants/theme";
import { Pressable, Text, View } from "react-native";

type props = {
  onPress: () => void;
  label: string;
};

export default function UnselectButton({ onPress, label }: props) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          alignItems: "center",
          alignSelf: "center",
          paddingHorizontal: 12,

          paddingVertical: 6,
          borderRadius: 32,
          borderColor: COLORS.surfaceAlternate,
          borderWidth: 1,
          marginTop: 8,
        }}
      >
        <Text
          style={{
            color: COLORS.textSecondary,
            fontFamily: "InterMedium",
            textAlign: "center",
            marginVertical: 4,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
