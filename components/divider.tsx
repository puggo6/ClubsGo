import { COLORS } from "@/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
type props = {
  vertPadding?: number;
};
export default function Divider({ vertPadding }: props) {
  return (
    <View
      style={[
        styles.divider,
        { marginHorizontal: vertPadding ? vertPadding : 10 },
      ]}
    />
  );
}
const styles = StyleSheet.create({
  divider: {
    alignSelf: "center",
    height: 2,
    backgroundColor: COLORS.surfaceLight,
    marginVertical: 10,
    paddingHorizontal: 30,
    width: "90%",
  },
});
