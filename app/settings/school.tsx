import DeletionModal from "@/components/deletionModal";
import { ButtonPair, LargeMonochromeButton } from "@/components/gradientButton";
import SchoolSetting from "@/components/schoolSetting";

import isWeb from "@/constants/isWeb";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/settings.styles";
import { AntDesign } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function school() {
  const insets = useSafeAreaInsets();
  const user = useUserData();
  const router = useRouter();
  const school = user?.userData.school;
  const leaveSchool = useMutation(api.users.leaveSchool);
  let fullSchool = undefined;

  fullSchool = useQuery(api.schools.getSchoolData, { schoolId: school?._id });
  const deleteSchool = useMutation(api.schools.deleteSchool);

  const pendingAdmins = fullSchool?.pendingAdminList;
  const admins = fullSchool?.adminList;
  const students = fullSchool?.users.filter((u) => u?.role === "student");
  const parents = fullSchool?.users.filter((u) => u?.role === "parent");
  const pendingGreater = (pendingAdmins?.length ?? 0) > 5;
  const adminGreater = (admins?.length ?? 0) > 5;
  const studentGreater = (students?.length ?? 0) > 5;
  const parentGreater = (parents?.length ?? 0) > 5;
  const pendingShown = pendingGreater
    ? pendingAdmins?.slice(0, 5)
    : pendingAdmins;
  const adminShown = adminGreater ? admins?.slice(0, 5) : admins;
  const studentShown = studentGreater ? students?.slice(0, 5) : students;
  const parentShown = parentGreater ? parents?.slice(0, 5) : parents;

  const eventData = useQuery(api.events.getManyEvents, {
    eventIds: fullSchool?.clubs?.flatMap((club) => club?.eventList ?? []) ?? [],
  });
  const upcomingEvents = eventData?.filter(
    (e) => e && dayjs(e.dateNumber).isAfter(dayjs()),
  );
  const isStudent = user?.userData.role === "student";
  const isAdmin = false;
  const isHeadAdmin = user?.userData.role === "superAdmin";
  const handleLeave = () => {
    router.push("/(tabs)");
    leaveSchool({});
  };
  const handleDelete = () => {
    router.push("/(tabs)");
    deleteSchool({ schoolId: school?._id });
  };
  const [deleteVisable, setDeleteVisable] = useState(false);

  const updateConfig = useMutation(api.schools.updateSchoolConfig);
  const [adminApproval, setAdminApproval] = useState(
    school?.configurations?.adminsNeedApproval ?? false,
  );
  const [clubAdminApproval, setClubAdminApproval] = useState(
    school?.configurations?.clubAdminsNeedApproval ?? false,
  );
  const [globalSchoolPage, setGlobalSchoolPage] = useState(
    school?.configurations?.globalSchoolPage ?? false,
  );
  const [hasChanges, setHasChanges] = useState(false);
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
  const handleSaveChanges = () => {
    updateConfig({
      schoolId: school?._id,
      adminApproval,
      clubAdminApproval,
      globalSchoolPage,
    });
    Toast.show({
      type: "success",
      text1: "Changes Successfully Saved",

      position: "top",
      visibilityTime: 2500,
      topOffset: 50,
    });
  };

  const SettingsHeader = ({ title }: { title: string }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginLeft: 20,
          marginRight: 20,
          marginTop: 10,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: "PoppinsMedium",
            color: COLORS.textSecondary,
          }}
        >
          {title}
        </Text>
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: COLORS.surfaceLight,
            marginLeft: 10,
          }}
        />
      </View>
    );
  };
  return (
    <View style={[{ flex: 1 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          backgroundColor: COLORS.background,
          flex: 1,
        }}
        contentContainerStyle={{
          paddingTop: insets.top,
          marginBottom: insets.bottom,
          marginRight: insets.right,
          marginLeft: insets.left,
        }}
      >
        <Pressable
          onPress={() => {
            router.push("/settings");
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
        <View
          style={[
            isWeb() && { marginHorizontal: 300 },
            { alignItems: "center" },
          ]}
        >
          {isHeadAdmin && user?.userData.approvedAdmin && (
            <View style={[styles.card, { width: isWeb() ? "45%" : "95%" }]}>
              <Text style={styles.title}>School Overview</Text>
              <View style={styles.cardDivider} />

              {[
                { label: "Students", value: students?.length ?? 0 },
                { label: "Parents", value: parents?.length ?? 0 },
                { label: "Clubs", value: school?.clubList?.length ?? 0 },
                { label: "Admins", value: admins?.length ?? 0 },
                {
                  label: "Pending Approvals",
                  value: school?.pendingAdminList?.length ?? 0,
                },
                {
                  label: "Upcoming Events",
                  value: upcomingEvents?.length ?? 0,
                },
              ].map((row, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.label}>{row.label}</Text>
                  <Text style={styles.value}>{row.value.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ marginBottom: 20, width: "100%" }}>
            <Text style={styles.midHeaderText}>Administration</Text>
            <View
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={styles.schoolDiv} />
            </View>
            <Text style={styles.smallInfoText}>{"Approved"}</Text>
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
            {user?.userData.approvedAdmin && isHeadAdmin && (
              <>
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
              </>
            )}

            <Text style={styles.midHeaderText}>Users</Text>
            <View
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={styles.schoolDiv} />
            </View>
            <Text style={styles.smallInfoText}>Parents</Text>
            <View style={styles.picturesContainer}>
              {parentShown && parentShown.length > 0 && (
                <>
                  {parentShown.map((u) => (
                    <Image
                      source={{ uri: u?.profilePicture }}
                      style={styles.smallUserAvatar}
                      key={u?._id}
                    />
                  ))}
                </>
              )}
              {parentGreater == true && (
                <Text style={styles.clearText}>
                  {"[" + (parents?.length ?? 0 - 5) + " more]"}
                </Text>
              )}
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
              {studentGreater == true && (
                <Text style={styles.clearText}>
                  {"[" + (students?.length ?? 0 - 5) + " more]"}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => router.push("/settings/fullSchoolUsers")}
            >
              <Text style={styles.linkText}>View All</Text>
            </TouchableOpacity>
          </View>
          {isHeadAdmin && user?.userData.approvedAdmin && (
            <>
              <Text style={styles.midHeaderText}>School Configurations</Text>
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View style={styles.schoolDiv} />
              </View>

              <SettingsHeader title="Onboarding" />
              <SchoolSetting
                title="Admins Require Approval"
                description="Admins must be approved after joining the school"
                value={adminApproval}
                onValueChange={() => {
                  setAdminApproval(!adminApproval);
                  setHasChanges(true);
                }}
              />
              <SchoolSetting
                title="Advisors Require Approval"
                description="Admins joining a club must be approved by an existing club advisor"
                value={clubAdminApproval}
                onValueChange={() => {
                  setClubAdminApproval(!clubAdminApproval);
                  setHasChanges(true);
                }}
              />
              <SettingsHeader title="Configurations" />
              <SchoolSetting
                title=" Toggle Global School Page (Beta)"
                description="Toggle the school page, where global announcements and events are displayed for all users in the school"
                value={globalSchoolPage}
                onValueChange={() => {
                  setGlobalSchoolPage(!globalSchoolPage);
                  setHasChanges(true);
                }}
              />
            </>
          )}

          <View
            style={{
              justifyContent: "flex-end",
              flex: 1,
              width: "100%",
              marginTop: 50,
              alignItems: "center",
            }}
          >
            {!isHeadAdmin ? (
              <LargeMonochromeButton
                title="Leave School"
                onPress={handleLeave}
              />
            ) : (
              <ButtonPair
                onPress={[() => setDeleteVisable(true), handleLeave]}
                buttonTitles={["Delete School", "Leave School"]}
                buttonWidth={isWeb() ? 350 : 180}
                buttonTypes={[2, 1]}
                disabledProp={[false, (school?.adminList?.length ?? 0) < 2]}
              />
            )}

            {(school?.adminList?.length ?? 0) < 2 && (
              <Text
                style={{
                  alignSelf: "center",
                  color: COLORS.textSecondary,
                  fontFamily: "InterMedium",
                  fontSize: 18,
                  textAlign: "center",
                  marginBottom: 20,
                  marginHorizontal: 20,
                }}
              >
                You cannot leave a school if you are the only admin. Please
                delete the school or transfer admin rights to another user
                before leaving.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
      <Animated.View
        style={[styles.saveButton, { bottom: 0, transform: [{ translateY }] }]}
      >
        <TouchableOpacity onPress={handleSaveChanges} style={styles.pressable}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </Animated.View>
      <DeletionModal
        title={school?.name}
        description="Your School and all of its data will be permanently deleted and cannot be recovered."
        visible={deleteVisable}
        onClose={() => setDeleteVisable(false)}
        onConfirm={() => handleDelete()}
      />
    </View>
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
