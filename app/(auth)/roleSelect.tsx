import GradientButton from "@/components/gradientButton";
import isWeb from "@/constants/isWeb";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/auth.styles";
import { useMutation } from "convex/react";
import { useState } from "react";
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { toggleRoleSelected } from "./login";

export default function RoleSelect() {
  const [userRole, setUserRole] = useState("student");
  const currentUser = useUserData();
  const updateUserRole = useMutation(api.users.updateUserRole);
  if (!currentUser) return;
  const handleContinue = async () => {
    updateUserRole({ userId: currentUser?.userData._id, updateRole: userRole });
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
        <View style={{ flexDirection: "column" }}>
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
                userRole === "parent" ? {} : { backgroundColor: "#6b7c93" },
              ]}
              onPress={() => setUserRole("parent")}
            >
              <Text style={[styles.roleButtonText]}>Parent</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.roleButtons}>
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
