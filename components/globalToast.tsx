import { COLORS } from "@/constants/theme";
import React from "react";
import { Text, View } from "react-native";
import { BaseToastProps } from "react-native-toast-message";

const SuccessToast = ({ text1, text2 }: BaseToastProps) => (
  <View style={{ flexDirection: "row" }}>
    <View
      style={{
        width: 6, // thickness of the bar
        backgroundColor: COLORS.publicGreen,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
      }}
    />

    <View
      style={{
        backgroundColor: COLORS.surfaceLight,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        padding: 14,
      }}
    >
      <Text
        style={{
          color: COLORS.white,
          fontFamily: "PoppinsBold",
          fontSize: 20,
        }}
      >
        {text1}
      </Text>
      {text2 ? (
        <Text
          style={{
            color: COLORS.textPrimary,
            fontFamily: "InterRegular",
            fontSize: 16,
          }}
        >
          {text2}
        </Text>
      ) : null}
    </View>
  </View>
);

const ErrorToast = ({ text1, text2 }: BaseToastProps) => (
  <View style={{ flexDirection: "row" }}>
    <View
      style={{
        width: 6, // thickness of the bar
        backgroundColor: COLORS.privateRed,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        marginLeft: 25,
      }}
    />

    <View
      style={{
        backgroundColor: COLORS.surfaceLight,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        padding: 14,
        marginRight: 25,
      }}
    >
      <Text
        style={{
          color: COLORS.white,
          fontFamily: "PoppinsBold",
          fontSize: 20,
        }}
      >
        {text1}
      </Text>
      {text2 && (
        <Text
          style={{
            color: COLORS.textPrimary,
            fontFamily: "InterRegular",
            fontSize: 16,
            maxWidth: 360,
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {text2}
        </Text>
      )}
    </View>
  </View>
);

export const toastConfig = {
  success: (props: BaseToastProps) => <SuccessToast {...props} />,
  error: (props: BaseToastProps) => <ErrorToast {...props} />,
};
