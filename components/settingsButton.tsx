import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/settings.styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type props = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  children: React.ReactNode;
  screenWidth: number;
  notification?: boolean;
};

export default function SettingsButton({
  title,
  subtitle,
  onPress,
  children,
  screenWidth,
  notification,
}: props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
      <View style={styles.buttonContainer}>
        <View style={styles.innerButtonContainer}>
          <View style={{ position: "absolute" }}>{children}</View>
          <View style={{ flex: 1, justifyContent: "center", marginLeft: 50 }}>
            <Text
              style={[styles.buttonText, { maxWidth: screenWidth * 0.8 }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "PoppinsRegular",
                  color: COLORS.textMuted,
                  maxWidth: screenWidth * 0.7,
                }}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {notification && (
            <View
              style={{
                justifyContent: "flex-start",
                top: -1,
                left: -18,
                height: "100%",
              }}
            >
              <View
                style={{
                  aspectRatio: 1,
                  width: 8,
                  backgroundColor: COLORS.accentB,
                  borderRadius: 100,
                }}
              />
            </View>
          )}
          <View
            style={{
              alignItems: "flex-end",
              justifyContent: "center",
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
