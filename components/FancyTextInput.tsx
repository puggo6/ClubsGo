import { styles } from "@/styles/create.styles";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TextInput, View } from "react-native";

type ftiProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function FancyTextInput({
  label,
  value,
  onChangeText,
  placeholder,
}: ftiProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <LinearGradient
        colors={["#12c2e9", "#c471ed", "#f64f59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.inputContainer}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#888"
            style={styles.input}
          />
        </View>
      </LinearGradient>
    </View>
  );
}
