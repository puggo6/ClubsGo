import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/messages.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  Pressable,
  SectionList,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import GradientButton from "./gradientButton";
import { SchoolMemberCard, SmallMemberCard } from "./memberCard";
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
    fullSchool = useQuery(api.schools.getSchoolData, { schoolId: school?._id });
  }

  const students = fullSchool?.users.filter((u) => u?.role === "student");
  const headAdmins = fullSchool?.users.filter((u) => u?.role === "superAdmin");
  const createChat = useMutation(api.groupChats.createChat);
  const fixedAdmins = fullSchool?.adminList.filter(
    (u) => u?._id !== user?.userData._id
  );
  const fixedStudents = fullSchool?.users.filter(
    (u) => u?._id !== user?.userData._id
  );
  let filteredAdmins = useMemo(() => {
    return [...(fullSchool?.adminList ?? []), ...(headAdmins ?? [])].filter(
      (u) => {
        const matchesSearch =
          searchQuery.length === 0 ||
          u?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        const notSelected = u ? !selectedUsers?.includes(u?._id) : true;
        const notUser = u ? u._id !== user?.userData._id : false;
        return matchesSearch && notSelected && notUser;
      }
    );
  }, [searchQuery, fullSchool?.adminList, selectedUsers]);
  let filteredStudents = useMemo(() => {
    return students?.filter((u) => {
      const matchesSearch =
        searchQuery.length === 0 ||
        u?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      const notSelected = u ? !selectedUsers?.includes(u?._id) : true;
      const notUser = u ? u._id !== user?.userData._id : false;
      return matchesSearch && notSelected && notUser;
    }) as any[];
  }, [searchQuery, students, selectedUsers]);
  const handleSelectUser = (u: Id<"users">, student: boolean) => {
    console.log("selecting");
    setSelectedUsers([...(selectedUsers ?? []), u]);
  };
  const handleUnselect = (u: Id<"users">, student: boolean) => {
    console.log("unselecting");
    setSelectedUsers(selectedUsers.filter((user) => user !== u));
  };
  const handleCreate = () => {
    let users = [...selectedUsers];
    if (user?.userData._id) users = [...selectedUsers, user.userData._id];
    createChat({ users, name: chatName });
    onCreate();
  };
  const MEMBERDATA = [
    {
      title: "Admins",
      data: filteredAdmins,
    },

    {
      title: "Students",
      data: filteredStudents,
    },
  ];
  const VISIBLE_SECTIONS = MEMBERDATA.map(({ title, data }) => ({
    title,
    data: data ?? [],
  }));
  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback
        onPressIn={Keyboard.dismiss}
        style={{ flex: 1 }}
      >
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
          <View style={{ width: "100%" }}>
            <StylizedInput
              value={chatName}
              onChangeText={setName}
              placeholder="Tap to edit text..."
              label="Groupchat Name"
              dark={true}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FlatList
              data={selectedUsers}
              keyExtractor={(item) => item.toString()}
              numColumns={2}
              renderItem={({ item }) => {
                const u = fullSchool?.users.find((u) => u?._id === item);
                return (
                  <Pressable
                    onPress={() => handleUnselect(item, u?.role === "student")}
                  >
                    <View style={{ margin: 5 }}>
                      <SmallMemberCard
                        userPFP={u?.profilePicture}
                        name={u?.fullName ?? ""}
                        email={""}
                        isMember={
                          (u?.role === "student"
                            ? true
                            : u?._id && school?.adminList?.includes(u?._id)) ??
                          false
                        }
                        onPress={() => {}}
                        approvalCard={false}
                      />
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>

          <Text style={styles.label}>Select Members</Text>
          <View style={styles.memberContainer}>
            <View style={{ width: Dimensions.get("screen").width * 0.78 }} />
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
                  placeholder={"Search"}
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
                renderItem={({ item }) => {
                  return (
                    <Pressable
                      onPress={() =>
                        handleSelectUser(
                          item?._id,
                          item?.role === "student" ? true : false
                        )
                      }
                    >
                      <SchoolMemberCard
                        isMember={
                          (item?.role === "student"
                            ? true
                            : item?._id &&
                              school?.adminList?.includes(item?._id)) ?? false
                        }
                        userPFP={item?.profilePicture}
                        name={item?.fullName ?? ""}
                        email={item?.email ?? ""}
                        onPress={() => {}}
                        approvalCard={false}
                      />
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
                ItemSeparatorComponent={({}) => (
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
      </TouchableWithoutFeedback>
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
