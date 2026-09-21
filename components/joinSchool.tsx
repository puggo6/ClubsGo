import isWeb from "@/constants/isWeb";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/create.styles";
import { useMutation } from "convex/react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  Platform,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import GradientButton from "./gradientButton";
import StylizedInput from "./stylizedInput";

type props = {
  onSwitch?: () => void;
};
export default function JoinSchool({ onSwitch }: props) {
  const [code, setCode] = useState("");
  const currentUser = useUserData();
  const userJoinSchool = useMutation(api.users.joinSchool);
  const router = useRouter();
  const handleHaptics = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };
  const handelJoinSchool = async (joinCode: string) => {
    try {
      await userJoinSchool({ joinCode: joinCode });

      console.log("successfully joined school with code ", code);
      router.push("/(tabs)/browse");
      Toast.show({
        type: "success",
        text1: "School Joined!",

        position: "top",
        visibilityTime: 2500,
        topOffset: 50,
      });
      handleHaptics();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "School Join Failed",
        text2: "Ensure that the join code is valid",
        position: "top",
        visibilityTime: 2500,
        topOffset: 50,
      });
      handleHaptics();
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

        <GradientButton
          title="Join"
          onPress={() => handelJoinSchool(code)}
          fixSpacing={isWeb()}
        />
        {onSwitch && (
          <View style={styles.existingSchoolPrompt}>
            <Text style={styles.existingSchoolText}>
              Your school or institution not yet created?{" "}
              <Text onPress={onSwitch} style={styles.existingSchoolLink}>
                Create a new school →
              </Text>
            </Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}
