import GradientButton from "@/components/gradientButton";
import StylizedInput from "@/components/stylizedInput";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/create.styles";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView, Text, View } from "react-native";
import Toast from "react-native-toast-message";
type props = {
  onSwitch: () => void;
};

export default function CreateSchool({ onSwitch }: props) {
  const [name, setName] = useState("");
  const [sName, setShortName] = useState("");
  const [key, setKey] = useState("");

  const router = useRouter();

  const createNewSchool = useMutation(api.schools.createSchool);

  const handleCreateSchool = async () => {
    if (!name || !sName) {
      return;
    }

    try {
      await createNewSchool({ name, sName, key });
      router.push("/(tabs)");
    } catch (error) {
      const message = String(error);
      if (message.includes("KEY_DNE")) {
        Toast.show({
          type: "error",
          text1: "Invalid Key",
          text2: "Entered Key does not exist.",
          position: "top",
          visibilityTime: 2500,
          topOffset: 50,
        });
      } else if (message.includes("KEY_USED")) {
        Toast.show({
          type: "error",
          text1: "Invalid Key",
          text2: "Entered Key is already used.",
          position: "top",
          visibilityTime: 2500,
          topOffset: 50,
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create a School </Text>
      </View>
      <LinearGradient
        colors={["#12c2e9", "#c471ed", "#f64f59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />
      <View style={styles.inputsContainer}>
        <StylizedInput
          label="School Name"
          value={name}
          onChangeText={setName}
          placeholder="EX: James Smith High School"
          dark={false}
          wordCapitalize={true}
        />
        <StylizedInput
          label="Shortened School Name"
          value={sName}
          onChangeText={setShortName}
          placeholder="EX: JSHS"
          dark={false}
          capitalize={true}
        />
        <StylizedInput
          label="School Creation Key"
          value={key}
          onChangeText={setKey}
          placeholder="Enter the key provided to your institution upon purchase of ClubsGo"
          dark={false}
          capitalize={true}
        />
      </View>

      <GradientButton
        title="Create"
        onPress={() => handleCreateSchool()}
        fixSpacing
      />
      <View style={styles.existingSchoolPrompt}>
        <Text style={styles.existingSchoolText}>
          Already part of a school?{" "}
          <Text onPress={onSwitch} style={styles.existingSchoolLink}>
            Join an existing school →
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
