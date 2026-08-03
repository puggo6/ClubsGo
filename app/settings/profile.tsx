import StylizedInput from "@/components/stylizedInput";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/settings.styles";
import { AntDesign } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Keyboard, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function profile() {
  const currentUser = useUserData();
  const insets = useSafeAreaInsets();
  const [newName, setNewName] = React.useState(
    currentUser?.userData.fullName || "",
  );
  const [hasChanges, setHasChanges] = React.useState(false);

  const cleanClubs = useMutation(api.clubs.removeDeletedUsersFromClubs);
  const cleanEvents = useMutation(api.clubs.removeDeletedEventsFromClubs);
  const cleanUsers = useMutation(api.schools.removeDeletedUsersFromSchools);
  const setUserRole = useMutation(api.users.setUserRole);
  const cleanUserFields = useMutation(api.users.cleanUserFields);
  const updateInfo = useMutation(api.users.updateUserProfile);
  const handleHaptics = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };
  const handleUpdateInfo = async () => {
    try {
      await updateInfo({ fullName: newName });
      Toast.show({
        type: "success",
        text1: "Changes Successfully Saved",
        text2: "Name Updated to " + newName,
        position: "top",
        visibilityTime: 2500,
        topOffset: 50,
      });
      handleHaptics();
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

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

  const translateY = useRef(new Animated.Value(100)).current;
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return; // skip animation on first render, stays hidden
    }

    Animated.spring(translateY, {
      toValue: hasChanges ? 0 : 100,
      useNativeDriver: true,
      damping: 15,
      stiffness: 150,
    }).start();
  }, [hasChanges]);

  return (
    <View style={{ backgroundColor: COLORS.background, flex: 1 }}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            marginBottom: insets.bottom,
            marginRight: insets.right,
            marginLeft: insets.left,
          },
        ]}
      >
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
          }}
          style={{ flex: 1, width: "100%" }}
        >
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

          <View style={styles.inputsContainer}>
            <StylizedInput
              label="Full Name"
              value={newName}
              onChangeText={(name) => {
                setNewName(name);
                setHasChanges(true);
              }}
              dark={false}
            />
          </View>
          <Animated.View
            style={[
              styles.saveButton,
              { bottom: 0, transform: [{ translateY }] },
            ]}
          >
            <Pressable onPress={handleUpdateInfo} style={styles.pressable}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}
