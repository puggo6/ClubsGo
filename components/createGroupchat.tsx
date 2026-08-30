import isWeb from "@/constants/isWeb";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/messages.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DismissKeyboardView from "./dismissKeyboardView";
import GradientButton from "./gradientButton";
import { SchoolMemberCard } from "./memberCard";
import StylizedInput from "./stylizedInput";

type props = {
  onCreate: () => void;
};

export default function CreateGroupchat({ onCreate }: props) {
  const user = useUserData();
  const [chatName, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);

  const school = user?.userData.school;
  let fullSchool = undefined;
  if (school?._id) {
    fullSchool = useQuery(api.schools.getSchoolData, { schoolId: school._id });
  }

  const students = fullSchool?.users.filter((u) => u?.role === "student");
  const headAdmins = fullSchool?.users.filter((u) => u?.role === "superAdmin");
  const createChat = useMutation(api.groupChats.createChat);

  const filteredAdmins = useMemo(() => {
    return [...(fullSchool?.adminList ?? [])].filter((u) => {
      const matchesSearch =
        searchQuery.length === 0 ||
        u?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      const notUser = u ? u._id !== user?.userData._id : false;
      return matchesSearch && notUser;
    });
  }, [searchQuery, fullSchool?.adminList, selectedUsers]);

  const filteredStudents = useMemo(() => {
    return (students ?? []).filter((u) => {
      const matchesSearch =
        searchQuery.length === 0 ||
        u?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      const notUser = u ? u._id !== user?.userData._id : false;
      return matchesSearch && notUser;
    });
  }, [searchQuery, students, selectedUsers]);

  const handleSelectUser = (id: Id<"users">) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleCreate = () => {
    let users = [...selectedUsers];
    if (user?.userData._id) users = [...selectedUsers, user.userData._id];
    if (selectedUsers.length < 1 || (selectedUsers.length > 1 && !chatName))
      return;
    createChat({
      users,
      name:
        selectedUsers.length < 2
          ? (fullSchool?.users.find((u) => u?._id == selectedUsers[0])
              ?.fullName ?? "")
          : chatName,
    });
    onCreate();
  };

  const VISIBLE_SECTIONS = [
    { title: "Admins", data: filteredAdmins },
    { title: "Students", data: filteredStudents },
  ];

  const SelectedTag = ({ id }: { id: Id<"users"> }) => {
    const u = fullSchool?.users.find((u) => u?._id === id);
    const firstName =
      u?.fullName?.substring(0, u.fullName.indexOf(" ") + 2) + ".";
    return (
      <Pressable onPress={() => handleSelectUser(id)} style={localStyles.tag}>
        <Text style={localStyles.tagText}>{firstName}</Text>
        <Ionicons name="close" size={12} color={COLORS.textSecondary} />
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <DismissKeyboardView>
        <View
          style={{
            marginVertical: 20,
            marginHorizontal: 20,
            alignItems: "center",
          }}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create a Chat</Text>
          </View>
          <LinearGradient
            colors={["#12c2e9", "#c471ed", "#f64f59"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBar}
          />

          {selectedUsers.length > 1 && (
            <View style={{ width: "100%" }}>
              <StylizedInput
                value={chatName}
                onChangeText={setName}
                placeholder="Tap to edit text..."
                label="Groupchat Name"
                dark={true}
              />
            </View>
          )}

          {selectedUsers.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={localStyles.tagScroll}
              contentContainerStyle={localStyles.tagContainer}
            >
              {selectedUsers.map((id) => (
                <SelectedTag key={id} id={id} />
              ))}
            </ScrollView>
          )}

          <Text style={styles.label}>Select Members</Text>

          <View style={styles.memberContainer}>
            <View
              style={{
                width: isWeb() ? "100%" : Dimensions.get("screen").width * 0.78,
              }}
            />

            {/* search bar */}
            <View
              style={{
                flexDirection: "column",
                backgroundColor: "#1c1c1c",
                borderWidth: 1,
                borderColor: "#2a2a2a",
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginHorizontal: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="search"
                  size={20}
                  color={COLORS.textSecondary}
                />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: COLORS.textPrimary,
                    marginLeft: 8,
                  }}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search"
                  placeholderTextColor="#888"
                  autoCapitalize="sentences"
                />
              </View>
            </View>

            <View style={styles.memberListBackdrop}>
              <SectionList
                sections={VISIBLE_SECTIONS}
                keyExtractor={(item) => item?._id ?? Math.random().toString()}
                contentContainerStyle={{ padding: 16 }}
                ListFooterComponent={<View />}
                ListFooterComponentStyle={{ height: 50 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = item?._id
                    ? selectedUsers.includes(item._id)
                    : false;
                  return (
                    <Pressable
                      onPress={() => item?._id && handleSelectUser(item._id)}
                    >
                      <View style={localStyles.memberRow}>
                        {/* checkbox */}
                        <View
                          style={[
                            localStyles.checkbox,
                            isSelected && localStyles.checkboxSelected,
                          ]}
                        >
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={14}
                              color={COLORS.white}
                            />
                          )}
                        </View>

                        <View style={{ flex: 1 }}>
                          <SchoolMemberCard
                            isMember={
                              (item?.role === "student"
                                ? true
                                : item?._id &&
                                  school?.adminList?.includes(item._id)) ??
                              false
                            }
                            userPFP={item?.profilePicture}
                            name={item?.fullName ?? ""}
                            email={item?.email ?? ""}
                            onPress={() => {}}
                            approvalCard={false}
                          />
                        </View>
                      </View>
                    </Pressable>
                  );
                }}
                renderSectionHeader={({ section: { title } }) => (
                  <>
                    <View style={styles.divSpace}>
                      <Text style={styles.divTitle}>{title}</Text>
                    </View>
                    <View
                      style={{
                        alignSelf: "center",
                        height: 2,
                        backgroundColor: COLORS.surfaceLight,
                        marginBottom: 10,
                        paddingHorizontal: 30,
                        width: "90%",
                      }}
                    />
                  </>
                )}
                ItemSeparatorComponent={() => (
                  <View
                    style={{
                      alignSelf: "center",
                      height: 2,
                      backgroundColor: COLORS.surfaceLight,
                      marginVertical: 10,
                      paddingHorizontal: 30,
                      width: "90%",
                    }}
                  />
                )}
              />
            </View>
          </View>
        </View>
      </DismissKeyboardView>

      <View
        style={{
          position: "absolute",
          alignItems: "center",
          bottom: -20,
          zIndex: 100,
          left: 0,
          right: 0,
        }}
      >
        <GradientButton title="Create" onPress={handleCreate} />
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  tagScroll: {
    width: "100%",
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: `${COLORS.primary}22`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}55`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: {
    color: COLORS.primary,
    fontFamily: "PoppinsMedium",
    fontSize: 12,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceAlternate,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
});
