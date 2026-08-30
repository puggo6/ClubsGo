import { LargeMonochromeButton } from "@/components/gradientButton";
import LoadingScreen from "@/components/loadingScreen";
import SettingsButton from "@/components/settingsButton";
import { APP_VERSION } from "@/constants/appVersion";
import { FEEDBACK_FORM_URL } from "@/constants/links";
import { isAdmin, isHeadAdmin, isParent, isStudent } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/settings.styles";
import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Dimensions, Image, Linking, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function profile() {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const currentUser = useUserData();
  const role = currentUser?.userData.role;
  const cleanClubs = useMutation(api.clubs.removeDeletedUsersFromClubs);
  const cleanEvents = useMutation(api.clubs.removeDeletedEventsFromClubs);
  const cleanUsers = useMutation(api.schools.removeDeletedUsersFromSchools);
  const setUserRole = useMutation(api.users.setUserRole);
  const cleanUserFields = useMutation(api.users.cleanUserFields);
  const screenWidth = Dimensions.get("window").width;
  const router = useRouter();

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

  if (!currentUser || !currentUser.userData) {
    return <LoadingScreen />;
  }

  const pendingParents = currentUser.userData.requestedParents.length > 0;
  const openFeedback = async () => {
    await Linking.openURL(FEEDBACK_FORM_URL);
  };
  return (
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <LinearGradient
        colors={["#12c2e9", "#c471ed", "#f64f59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />
      <View style={{ height: 20 }} />
      <Image
        source={{ uri: currentUser.profilePicture }}
        style={styles.userAvatar}
      />
      <Text style={styles.infoText}>{currentUser.userData.fullName}</Text>
      <Text style={styles.infoSubText}>
        {currentUser
          ? isStudent(role)
            ? "Student"
            : isHeadAdmin(role)
              ? "Head Administrator"
              : isParent(role)
                ? "Parent"
                : "Administrator"
          : ""}
        {currentUser.userData.school &&
          isAdmin(currentUser.userData.role) &&
          !currentUser.userData.approvedAdmin && (
            <Text style={{ color: COLORS.userColor }}> - Pending Approval</Text>
          )}
      </Text>

      <SettingsButton
        onPress={() => router.push("/settings/profile")}
        title="Profile"
        screenWidth={screenWidth}
      >
        <AntDesign name="user" size={32} color={COLORS.textSecondary} />
      </SettingsButton>
      {currentUser.userData.school && (
        <SettingsButton
          onPress={() => router.push("/settings/school")}
          title="School"
          screenWidth={screenWidth}
        >
          <FontAwesome6 name="school" size={32} color={COLORS.textSecondary} />
        </SettingsButton>
      )}
      {/* add red dot notification indicatior */}
      {isStudent(role) && (
        <SettingsButton
          onPress={() => router.push("/settings/parents")}
          title="Parents"
          screenWidth={screenWidth}
          notification={pendingParents}
        >
          <FontAwesome6
            name="user-group"
            size={32}
            color={COLORS.textSecondary}
          />
        </SettingsButton>
      )}
      {isParent(role) && (
        <SettingsButton
          onPress={() => router.push("/settings/linkChildren")}
          title="Link Children"
          screenWidth={screenWidth}
          notification={pendingParents}
        >
          <FontAwesome6
            name="user-group"
            size={32}
            color={COLORS.textSecondary}
          />
        </SettingsButton>
      )}
      <SettingsButton
        onPress={openFeedback}
        title="Feedback"
        screenWidth={screenWidth}
        notification={pendingParents}
        subtitle="Suggest a feature or report a bug"
      >
        <MaterialIcons name="feedback" size={32} color={COLORS.textSecondary} />
      </SettingsButton>
      <View style={{ height: 40 }} />
      <View
        style={{
          justifyContent: "flex-end",
          flex: 1,
          width: "100%",
          alignItems: "center",
        }}
      >
        <LargeMonochromeButton title="Sign Out" onPress={() => signOut()} />
        <Text
          style={{
            marginBottom: 20,
            color: COLORS.textMuted,
            fontFamily: "InterRegular",
          }}
        >
          {"ClubsGo Version " + APP_VERSION}
        </Text>
      </View>
    </View>
  );
}
