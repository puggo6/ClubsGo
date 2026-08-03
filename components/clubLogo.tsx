import { COLORS } from "@/constants/theme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

type props = {
  clubN: string;
  image?: string;
};

export default function ClubLogo({ clubN, image }: props) {
  let clubName = clubN;
  let initals = clubName.substring(0, 1).toUpperCase();
  let i = clubName.indexOf(" ");
  if (!image) {
    while (i >= 0) {
      initals += clubName.substring(i + 1, i + 2).toUpperCase();
      clubName = clubName.substring(i + 1);
      i = clubName.indexOf(" ");
    }
  }

  return (
    <LinearGradient
      colors={["#12c2e9", "#c471ed", "#f64f59"]} // Your signature gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 100,
        aspectRatio: 1,
        borderRadius: 75,
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20,
      }}
    >
      <View
        style={{
          width: 90,
          aspectRatio: 1,
          borderRadius: 60,
          backgroundColor: COLORS.surface,
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
        }}
      >
        {!image && (
          <Text
            style={{
              fontFamily: "MontserratBold",
              fontSize: 40,
              letterSpacing: 2,
              textAlign: "center",
              color: COLORS.textPrimary,
              width: 80,
            }}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {initals}
          </Text>
        )}
        {image && <Image source={image} />}
      </View>
    </LinearGradient>
  );
}
