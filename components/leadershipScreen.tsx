import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import GradientButton from "./gradientButton";
import StylizedInput from "./stylizedInput";
type props = {
  club: Id<"clubs">;
  previousRoles?: string[];
  close: () => void;
};
export default function LeadershipScreen({
  club,
  previousRoles,
  close,
}: props) {
  const [roles, setRoles] = useState(previousRoles ?? []);
  const saveRoles = useMutation(api.clubs.handleSaveRoles);
  const handleAddRole = (role: string) => {
    setRoles([...roles, role]);
    setCurrentRole("");
  };
  const handleRemoveRole = (role: string) => {
    setRoles(roles.filter((r) => r !== role));
  };
  const handleSave = async () => {
    await saveRoles({ club, roles });
    close();
  };
  const [currentRole, setCurrentRole] = useState("");
  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Configure Leadership Roles</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.sectionText}>Current Roles</Text>
      <View style={styles.roleContainer}>
        <View style={styles.tagSelection}>
          {roles.map((role) => (
            <Pressable key={role} onPress={() => handleRemoveRole(role)}>
              <View style={styles.tagBack}>
                <Text style={styles.tagText}>{role}</Text>
              </View>
            </Pressable>
          ))}
          {roles.length === 0 && (
            <View style={[styles.tagBack, { backgroundColor: "transparent" }]}>
              <Text style={styles.tagText}> </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.divider} />
      <Text style={styles.sectionText}>Add Role</Text>
      <StylizedInput
        value={currentRole}
        onChangeText={setCurrentRole}
        dark={true}
        label="Role Label"
        placeholder="Tap to change text..."
        wordCapitalize
      />
      <Pressable onPress={() => handleAddRole(currentRole)}>
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 16,
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "PoppinsMedium",
              fontSize: 16,
              color: COLORS.textSecondary,
              paddingRight: 8,
            }}
          >
            Add
          </Text>
          <Feather name="plus-circle" size={24} color={COLORS.textSecondary} />
        </View>
      </Pressable>
      <View style={{ marginTop: 50 }}>
        <GradientButton onPress={() => handleSave()} title="Save" />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 24,
    fontFamily: "PoppinsSemiBold",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: 0,
    marginVertical: 10,
  },
  sectionText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    marginBottom: 4,
    fontFamily: "InterRegular",
    paddingHorizontal: 2,
  },
  roleContainer: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    fontSize: 16,
    color: "#fff",
  },
  tagBack: {
    backgroundColor: "#2F2F3B",
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: "flex-start",
    borderRadius: 6,
    marginRight: 0,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 3,
  },
  tagText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: "InterMedium",
  },
  tagSelection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginVertical: 2,
    justifyContent: "center",
  },
});
