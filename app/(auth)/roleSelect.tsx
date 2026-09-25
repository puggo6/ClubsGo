import GradientButton from "@/components/gradientButton";
import isWeb from "@/constants/isWeb";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/auth.styles";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { toggleRoleSelected } from "./login";

const ROLES: { value: string; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
  { value: "administrator", label: "Admin" },
  { value: "superAdmin", label: "Head Admin" },
];

export default function RoleSelect() {
  const [userRole, setUserRole] = useState("student");
  const [grade, setGrade] = useState<number | undefined>(undefined);
  const currentUser = useUserData();
  const updateUserRole = useMutation(api.users.updateUserRole);
  if (!currentUser) return;
  const handleContinue = async () => {
    await updateUserRole({
      userId: currentUser.userData._id,
      updateRole: userRole,
      gradeLevel: userRole === "student" ? grade : undefined,
    });
    toggleRoleSelected();
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandSection}>
        <Image
          source={
            !isWeb()
              ? require("@/assets/images/flatLogoTag.png")
              : require("@/assets/images/largeFlatLogoTag.png")
          }
          style={!isWeb() ? { width: "100%" } : { width: "100%", height: 130 }}
          resizeMode={!isWeb() ? "contain" : "cover"}
        />
        <View style={styles.headerContainter}>
          <Text style={styles.header}>Your account is almost ready!</Text>
          <Text style={styles.subHeader}>
            To continue, select one of the following roles.
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            marginTop: 10,
            marginBottom: 15,
          }}
        >
          {ROLES.map((role) => {
            const selected = userRole === role.value;

            const tile = (
              <Pressable
                onPress={() => setUserRole(role.value)}
                style={({ pressed }) => ({
                  width: "100%",
                  minHeight: 52,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 11,
                  backgroundColor: selected
                    ? COLORS.surface
                    : COLORS.surfaceAlternate,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  selectable={false}
                  style={{
                    color: selected ? COLORS.textPrimary : COLORS.textSecondary,
                    fontSize: 15,
                    fontFamily: selected ? "InterSemiBold" : "InterRegular",
                  }}
                >
                  {role.label}
                </Text>
              </Pressable>
            );

            return (
              <View key={role.value} style={{ width: "46%" }}>
                {selected ? (
                  <LinearGradient
                    colors={["#f64f59", "#c471ed", "#12c2e9"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 12, padding: 2 }}
                  >
                    {tile}
                  </LinearGradient>
                ) : (
                  <View
                    style={{
                      borderRadius: 12,
                      padding: 2,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.06)",
                    }}
                  >
                    {tile}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.roleDescription}>
          You will be able to
          <Text style={{ fontFamily: "PoppinsBold" }}>
            {userRole === "student"
              ? " browse and join school clubs"
              : userRole === "parent"
                ? " manage your child's schedule and club activity"
                : userRole === "administrator"
                  ? " create and manage school clubs"
                  : " create schools and manage school activity"}
          </Text>
        </Text>

        <View style={styles.continue}>
          <GradientButton title="Continue" onPress={handleContinue} />
        </View>
      </View>
    </SafeAreaView>
  );
}
