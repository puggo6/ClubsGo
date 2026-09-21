import isWeb from "@/constants/isWeb";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ButtonPair } from "./gradientButton";
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
    if (role.length < 1) return;
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

  const handleDiscard = () => {
    setRoles(previousRoles ?? []);
    setCurrentRole("");
  };

  useEffect(() => {
    setRoles(previousRoles ?? []);
    setCurrentRole("");
  }, [previousRoles]);

  const [currentRole, setCurrentRole] = useState("");
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Configure Leadership Roles</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.sectionText}>Current Roles</Text>
      <View style={styles.roleContainer}>
        <View style={styles.tagSelection}>
          {roles.map((role) => (
            <View key={role} style={styles.tagContainer}>
              <View style={styles.tagBack}>
                <Text style={styles.tagText}>{role}</Text>
              </View>
              <Pressable
                onPress={() => handleRemoveRole(role)}
                style={styles.tagXButton}
                hitSlop={8}
              >
                <Feather name="x" size={10} color={COLORS.background} />
              </Pressable>
            </View>
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
        bottomSheet={!isWeb()}
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
        <ButtonPair
          onPress={[handleDiscard, handleSave]}
          buttonTitles={["Discard", "Save"]}
          buttonTypes={[1, 0]}
          buttonWidth={140}
        />
      </View>
    </View>
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
  tagContainer: {
    position: "relative",
    alignSelf: "flex-start",
    marginVertical: 3,
  },
  tagBack: {
    backgroundColor: "#2F2F3B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    borderRadius: 8,
    marginRight: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 16,
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
  tagXButton: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.grey,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
});
