import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/settings.styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
type props = {
  title: string;
  onPress: () => void;
  children: React.ReactNode;
  screenWidth: number;
};
export default function SettingsButton({
  title,
  onPress,
  children,
  screenWidth,
}: props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
      <View style={styles.buttonContainer}>
        <View style={styles.innerButtonContainer}>
          {children}
          <Text
            style={[styles.buttonText, { maxWidth: screenWidth * 0.8 }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {title}
          </Text>
          <View
            style={{
              alignItems: "flex-end",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={32}
              color={COLORS.textSecondary}
            />
          </View>
        </View>
        <View
          style={[
            styles.buttonDiv,
            {
              width: screenWidth * 0.9,
              alignSelf: "center",
              backgroundColor: COLORS.surfaceAlternate,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}
