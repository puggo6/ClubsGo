import GradientButton from "@/components/gradientButton";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/auth.styles";
import { useMutation } from "convex/react";
import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { roleSelected, toggleRoleSelected } from "./login";

export default function RoleSelect() {
  const [userRole, setUserRole] = useState("student");
  const currentUser = useUserData();
  const updateUserRole = useMutation(api.users.updateUserRole);
  if (!currentUser) return;
  const handleContinue = async () => {
    console.log(
      "started continue, ",
      userRole,
      " ",
      currentUser.fullName,
      " roleselected: ",
      roleSelected
    );
    updateUserRole({ userId: currentUser?.userData._id, updateRole: userRole });
    toggleRoleSelected();
    console.log("roleSelected: ", roleSelected);
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandSection}>
        <Image
          source={require("@/assets/images/flatLogoTag.png")}
          style={styles.topLogo}
        />
        <View style={styles.headerContainter}>
          <Text style={styles.header}>Your account is almost ready!</Text>
          <Text style={styles.subHeader}>
            To continue, select one of the following roles.
          </Text>
        </View>

        <View style={styles.roleButtons}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              userRole === "student" ? {} : { backgroundColor: "#6b7c93" },
            ]}
            onPress={() => setUserRole("student")}
          >
            <Text style={[styles.roleButtonText]}>Student</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleButton,
              userRole === "administrator"
                ? {}
                : { backgroundColor: "#6b7c93" },
            ]}
            onPress={() => setUserRole("administrator")}
          >
            <Text style={[styles.roleButtonText]}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleButton,
              userRole === "superAdmin" ? {} : { backgroundColor: "#6b7c93" },
            ]}
            onPress={() => setUserRole("superAdmin")}
          >
            <Text style={[styles.roleButtonText]}>Head Admin</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.roleDescription}>
          You will be able to
          <Text style={{ fontFamily: "PoppinsBold" }}>
            {userRole === "student"
              ? " browse and join school clubs"
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
