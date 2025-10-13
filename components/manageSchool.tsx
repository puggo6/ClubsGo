import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useSchoolData } from "@/hooks/useSchoolData";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/create.styles";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

export default function ManageSchool() {
  const currentUser = useUserData();
  const school = useSchoolData();
  const leaveSchool = useMutation(api.users.leaveSchool);
  const router = useRouter();
  const handleLeave = async () => {
    try {
      await leaveSchool();
      router.push("/(tabs)");
    } catch (error) {
      console.log("error leaving school: ", error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage School</Text>
      </View>
      <LinearGradient
        colors={["#12c2e9", "#c471ed", "#f64f59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />

      <View style={styles.schoolInfoContainer}>
        <Text style={styles.schoolName}>
          {school.schoolData?.schoolName ?? ""}
        </Text>
        <Text
          style={[
            styles.schoolName,
            {
              fontSize: 22,
              color: COLORS.textPrimary,
              marginTop: -10,
            },
          ]}
        >
          {school.schoolData?.schoolShortNameL}
        </Text>
        <Text style={[styles.infoText, { fontSize: 20, color: "#E0E0E0" }]}>
          Join Code:
          <Text style={{ fontFamily: "OpenSansSemiBold" }}>
            {" " + school.schoolData?.joinCode}
          </Text>
        </Text>
        <Text style={[styles.infoText, { fontSize: 20, color: "#E0E0E0" }]}>
          Total Members:
          <Text style={{ color: COLORS.primary }}>
            {" " + school.schoolData?.users.length}
          </Text>
        </Text>
        <Text style={[styles.infoText, { fontSize: 20, color: "#E0E0E0" }]}>
          Total Clubs:
          <Text style={{ color: COLORS.accentA }}>
            {" " + school.schoolData?.clubs.length}
          </Text>
        </Text>
        <TouchableOpacity onPress={handleLeave}>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: 24,
              fontFamily: "OpenSansSemiBold",
            }}
          >
            Leave School
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
