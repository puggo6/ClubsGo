import GradientButton from "@/components/gradientButton";
import StylizedInput from "@/components/stylizedInput";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/create.styles";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, Text, View } from "react-native";

export default function CreateSchool() {
  const [name, setName] = useState("");
  const [sName, setShortName] = useState("");

  const router = useRouter();

  const createNewSchool = useMutation(api.schools.createSchool);

  const handleCreateSchool = async () => {
    if (!name || !sName) {
      return;
    }

    try {
      await createNewSchool({ name, sName });
      router.push("/(tabs)");
    } catch (error) {
      console.log("Error creating school: ", error);
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
      </View>
      <GradientButton title="Create" onPress={() => handleCreateSchool()} />
    </SafeAreaView>
  );
}
