import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/settings.styles";
import { useAuth } from "@clerk/clerk-expo";
import { AntDesign } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function profile() {
  const { signOut } = useAuth();
  const currentUser = useUserData();

  const cleanClubs = useMutation(api.clubs.removeDeletedUsersFromClubs);
  const cleanEvents = useMutation(api.clubs.removeDeletedEventsFromClubs);
  const cleanUsers = useMutation(api.schools.removeDeletedUsersFromSchools);
  const setUserRole = useMutation(api.users.setUserRole);
  const cleanUserFields = useMutation(api.users.cleanUserFields);
  const handleClean = async () => {
    try {
      await cleanClubs();
      alert("Cleaned up deleted users from clubs!");
    } catch (err) {
      console.error("Cleanup failed:", err);
    }
  };

  const handleEventClean = async () => {
    try {
      await cleanEvents();
      alert("Cleaned up deleted events from clubs!");
    } catch (err) {
      console.error("Cleanup failed:", err);
    }
  };

  const handleSchoolClean = async () => {
    try {
      await cleanUsers();
      alert("Cleaned up deleted users from schools!");
    } catch (err) {
      console.error("Cleanup failed:", err);
    }
  };

  const handleUserClean = async () => {
    try {
      await cleanUserFields();
      alert("Cleaned up deleted clubs from user fields");
    } catch (err) {
      console.error("Cleanup failed:", err);
    }
  };

  const handleUserRole = async (role: string) => {
    try {
      await setUserRole({ setRole: role });
    } catch {
      console.log("error setting userRole");
    }
  };

  if (!currentUser || !currentUser.userData) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        onPress={() => {
          router.back();
        }}
        style={{ justifyContent: "flex-start", width: "100%" }}
      >
        <AntDesign
          name="left"
          size={32}
          color={COLORS.textSecondary}
          style={{ marginLeft: 20 }}
        />
      </Pressable>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Profile</Text>
      </View>
      <LinearGradient
        colors={["#12c2e9", "#c471ed", "#f64f59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />

      <Text style={styles.infoText}>{currentUser.userData.school?.name}</Text>
      <TouchableOpacity onPress={() => signOut()}>
        <Text style={{ color: "white" }}>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleClean}>
        <Text style={{ color: "white" }}>clean club members</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleEventClean}>
        <Text style={{ color: "white" }}>clean club events</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSchoolClean}>
        <Text style={{ color: "white" }}>clean school users</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleUserClean}>
        <Text style={{ color: "white" }}>clean user fields</Text>
      </TouchableOpacity>
      <View style={styles.roleButtons}>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => {
            handleUserRole("student");
          }}
        >
          <Text style={[styles.roleButtonText]}>Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => {
            handleUserRole("administrator");
          }}
        >
          <Text style={[styles.roleButtonText]}>Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => {
            handleUserRole("superAdmin");
          }}
        >
          <Text style={[styles.roleButtonText]}>Head Admin</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.roleButton}
        onPress={() => console.log(currentUser.userData.role)}
      >
        <Text style={[styles.roleButtonText]}>test role</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
