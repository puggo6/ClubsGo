import { LargeMonochromeButton } from "@/components/gradientButton";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/settings.styles";
import { AntDesign } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function school() {
  const user = useUserData();
  const router = useRouter();
  const school = user?.userData.school;
  const leaveSchool = useMutation(api.users.leaveSchool);
  let fullSchool = undefined;
  if (school?._id) {
    fullSchool = useQuery(api.schools.getSchoolData, { schoolId: school?._id });
  }

  const pendingAdmins = fullSchool?.pendingAdminList;
  const admins = fullSchool?.adminList;
  const students = fullSchool?.users.filter((u) => u?.role === "student");
  const pendingGreater = (pendingAdmins?.length ?? 0) > 5;
  const adminGreater = (admins?.length ?? 0) > 5;
  const studentGreater = (pendingAdmins?.length ?? 0) > 5;
  const pendingShown = pendingGreater
    ? pendingAdmins?.slice(0, 5)
    : pendingAdmins;
  const adminShown = adminGreater ? admins?.slice(0, 5) : admins;
  const studentShown = studentGreater ? students?.slice(0, 5) : students;

  const isStudent = user?.userData.role === "student";
  const isAdmin = false;
  const isHeadAdmin = user?.userData.role === "administrator";
  const handleLeave = () => {
    console.log("stated leave");
    leaveSchool({});
  };
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
        <View style={styles.schoolTexts}>
          <Text style={styles.subHeaderText}>
            {isHeadAdmin ? "Currently Managing" : "Currently Joined"}
          </Text>
          <Text
            style={styles.schoolName}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {school?.name}
          </Text>
          <Text style={styles.joinCode}>
            Join Code:
            <Text style={{ fontFamily: "PoppinsBold" }}>
              {" " + school?.joinCode}
            </Text>
          </Text>
        </View>
      </View>
      <LinearGradient
        colors={["#12c2e9", "#c471ed", "#f64f59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />
      <View style={{ marginBottom: 20, width: "100%" }}>
        <Text style={styles.midHeaderText}>Staff</Text>
        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={styles.schoolDiv} />
        </View>
        <Text style={styles.smallInfoText}>Approved</Text>
        <View style={styles.picturesContainer}>
          {adminShown && adminShown.length > 0 && (
            <>
              {adminShown.map((u) => (
                <Image
                  source={{ uri: u?.profilePicture }}
                  style={styles.smallUserAvatar}
                  key={u?._id}
                />
              ))}
            </>
          )}
          {adminGreater == true && (
            <Text style={styles.clearText}>
              {"[" + (admins?.length ?? 0 - 5) + " more]"}
            </Text>
          )}
        </View>
        <Text style={styles.smallInfoText}>Pending</Text>
        <View style={styles.picturesContainer}>
          {pendingShown && pendingShown.length > 0 && (
            <>
              {pendingShown.map((u) => (
                <Image
                  source={{ uri: u?.profilePicture }}
                  style={styles.smallUserAvatar}
                  key={u?._id}
                />
              ))}
            </>
          )}
          {adminGreater == true && (
            <Text style={styles.clearText}>
              {"[" + (admins?.length ?? 0 - 5) + " more]"}
            </Text>
          )}
        </View>

        <Text style={styles.midHeaderText}>Students</Text>
        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={styles.schoolDiv} />
        </View>
        <Text style={styles.smallInfoText}>Students</Text>
        <View style={styles.picturesContainer}>
          {studentShown && studentShown.length > 0 && (
            <>
              {studentShown.map((u) => (
                <Image
                  source={{ uri: u?.profilePicture }}
                  style={styles.smallUserAvatar}
                  key={u?._id}
                />
              ))}
            </>
          )}
          {adminGreater == true && (
            <Text style={styles.clearText}>
              {"[" + (admins?.length ?? 0 - 5) + " more]"}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => router.push("/settings/fullSchoolUsers")}
        >
          <Text style={styles.linkText}>View All</Text>
        </TouchableOpacity>
      </View>

      <LargeMonochromeButton title="Leave School" onPress={handleLeave} />
    </SafeAreaView>
  );
}
/*
 <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ justifyContent: "flex-start", paddingLeft: 50 }}>
          <Text style={styles.schoolInfoText}>{"Number of Members"}</Text>
        </View>
        <Entypo style={styles.dotIcon} name="dot-single" size={24} />
        <View style={{ justifyContent: "flex-end" }}>
          <Text
            style={[
              styles.schoolInfoText,
              { color: COLORS.accentA, paddingRight: 50 },
            ]}
          >
            {school?.userList.length}
          </Text>
        </View>
      </View>
      <View style={styles.schoolDiv} />
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ justifyContent: "flex-start", paddingLeft: 50 }}>
          <Text style={styles.schoolInfoText}>{"Number of Clubs"}</Text>
        </View>
        <Entypo style={styles.dotIcon} name="dot-single" size={24} />
        <View style={{ justifyContent: "flex-end" }}>
          <Text
            style={[
              styles.schoolInfoText,
              { color: COLORS.accentB, paddingRight: 50 },
            ]}
          >
            {school?.clubList.length}
          </Text>
        </View>
      </View>
      <View style={styles.schoolDiv} />
*/
