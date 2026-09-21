import { COLORS } from "@/constants/theme";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import {
  DimensionValue,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDefaultStyles } from "react-native-ui-datepicker";

type props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  dark: boolean;
  capitalize?: boolean;
  filterPress?: () => void;
  wordCapitalize?: boolean;
  width?: DimensionValue;
  bottomSheet?: boolean;
};

type containerProps = {
  label?: string;
  dark: boolean;
  children?: React.ReactNode;
};
type customProps = {
  label?: string;
  value: Date;
  onChange: () => void;
  mode?: "date" | "time" | "datetime";
};

export default function StylizedInput({
  label,
  value,
  onChangeText,
  placeholder,
  dark = false,
  capitalize = false,
  wordCapitalize = false,
  width,
  bottomSheet,
}: props) {
  const [inputHeight, setInputHeight] = useState(40);
  return (
    <View style={[styles.container, width ? { width: width } : {}]}>
      {label && <Text style={styles.label}>{label}</Text>}
      {bottomSheet ? (
        <BottomSheetTextInput
          scrollEnabled={false}
          style={[
            styles.input,
            dark ? { backgroundColor: COLORS.background } : null,
            { textAlignVertical: "top" },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#888"
          multiline
          numberOfLines={1}
          autoCapitalize={
            capitalize ? "characters" : wordCapitalize ? "words" : "sentences"
          }
        />
      ) : (
        <TextInput
          scrollEnabled={false}
          style={[
            styles.input,
            dark ? { backgroundColor: COLORS.background } : null,
            { textAlignVertical: "top" },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#888"
          multiline
          numberOfLines={1}
          autoCapitalize={
            capitalize ? "characters" : wordCapitalize ? "words" : "sentences"
          }
        />
      )}
    </View>
  );
}

export function LargeStylizedInput({
  label,
  value,
  onChangeText,
  placeholder,
  dark = false,
  capitalize = false,
}: props) {
  const [inputHeight, setInputHeight] = useState(40);
  return (
    <View style={[styles.container, { height: 200 }]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          dark ? { backgroundColor: COLORS.background } : null,
          { textAlignVertical: "top", height: 200 },
          { borderRadius: 20 },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#888"
        multiline
        numberOfLines={1}
        autoCapitalize="sentences"
      />
    </View>
  );
}
export function StylizedCustomDate({
  label,
  value,
  onChange,
  mode,
}: customProps) {
  let today = new Date();
  const defaultStyles = useDefaultStyles();
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}
export function StylizedSearch({
  label,
  value,
  onChangeText,
  placeholder,
  dark = false,
  filterPress,
}: props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1c1c1c",
        borderWidth: 1,
        borderColor: "#2a2a2a",
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginHorizontal: 16,
      }}
    >
      <Ionicons name="search" size={20} color={COLORS.textSecondary} />

      <TextInput
        style={{
          flex: 1,
          fontSize: 16,
          color: COLORS.textPrimary,
          marginLeft: 8,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#888"
        autoCapitalize="sentences"
      />
      <Pressable onPress={filterPress}>
        <AntDesign name="filter" color={COLORS.textSecondary} size={20} />
      </Pressable>
    </View>
  );
}
export function StylizedContainer({
  label,

  dark = false,
  children,
}: containerProps) {
  const [inputHeight, setInputHeight] = useState(40);
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.input,
          dark ? { backgroundColor: COLORS.background } : null,
          ,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingVertical: 12,
  },
  label: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 4,
    fontFamily: "InterRegular",
    paddingHorizontal: 2,
  },
  input: {
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});
