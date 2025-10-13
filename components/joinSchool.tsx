import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/create.styles";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  Platform,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import GradientButton from "./gradientButton";
import StylizedInput from "./stylizedInput";

export default function JoinSchool() {
  const [code, setCode] = useState("");
  const currentUser = useUserData();
  const userJoinSchool = useMutation(api.users.joinSchool);
  const router = useRouter();
  const handelJoinSchool = async (joinCode: string) => {
    try {
      await userJoinSchool({ joinCode: joinCode });

      console.log("successfully joined school with code ", code);
      router.push("/(tabs)/browse");
    } catch (error) {
      throw new Error("Join School failed");
    }
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={Platform.OS === "web" ? undefined : Keyboard.dismiss}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: COLORS.background }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Join a School</Text>
        </View>
        <LinearGradient
          colors={["#12c2e9", "#c471ed", "#f64f59"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBar}
        />
        <View style={styles.inputsContainer}>
          <StylizedInput
            label="School Code"
            value={code}
            onChangeText={setCode}
            placeholder="EX: AN2G8"
            dark={false}
            capitalize={true}
          />
        </View>
        <GradientButton title="Join" onPress={() => handelJoinSchool(code)} />
      </View>
    </TouchableWithoutFeedback>
  );
}
