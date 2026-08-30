import { SchoolMemberCard } from "@/components/memberCard";
import { StylizedSearch } from "@/components/stylizedInput";
import UserInfoModal from "@/components/userInfo";
import { isAdmin, isHeadAdmin, isParent, isStudent } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/settings.styles";
import { AntDesign } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function fullSchoolUsers() {
  const user = useUserData();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<
    Doc<"users"> | undefined
  >(undefined);

  const school = user?.userData.school;

  const fullSchool = useQuery(
    api.schools.getSchoolData,
    school?._id ? { schoolId: school._id } : "skip",
  );

  const approveUser = useMutation(api.schools.approveJoinRequest);

  const users = useMemo(() => {
    return fullSchool?.users.filter((u) =>
      u?.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, fullSchool?.users]);

  const admins = useMemo(() => {
    return (fullSchool?.adminList ?? []).filter((u) =>
      u?.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, fullSchool?.adminList]);

  const pendingAdmins = useMemo(() => {
    return (fullSchool?.pendingAdminList ?? []).filter((u) =>
      u?.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, fullSchool?.pendingAdminList]);

  if (!school?._id) return null;

  const handleUserInfo = (u: Doc<"users"> | undefined) => {
    if (!u) return;
    setSelectedMember(u);
  };

  const handleApprove = (userId: Id<"users">) => {
    approveUser({ userId, schoolId: school._id });
  };

  const isHeadAdminApproved =
    isHeadAdmin(user?.userData.role) && user?.userData.approvedAdmin;

  let MEMBERDATA = [
    {
      title: "Admins",
      data: admins,
    },
    {
      title: "Parents",
      data: users?.filter((u) => isParent(u?.role)) ?? [],
    },
    {
      title: "Students",
      data: users?.filter((u) => isStudent(u?.role)) ?? [],
    },
  ];

  if (isHeadAdminApproved) {
    MEMBERDATA = [
      {
        title: "Head Admins",
        data: admins.filter((u) => isHeadAdmin(u?.role)),
      },
      {
        title: "Administrators",
        data: admins.filter((u) => isAdmin(u?.role) && !isHeadAdmin(u?.role)),
      },
      {
        title: "Pending Admins",
        data: pendingAdmins,
      },
      {
        title: "Parents",
        data: users?.filter((u) => isParent(u?.role)) ?? [],
      },
      {
        title: "Students",
        data: users?.filter((u) => isStudent(u?.role)) ?? [],
      },
    ];
  }

  const VISIBLE_SECTIONS = MEMBERDATA.filter((s) => (s.data?.length ?? 0) > 0) // ✅ hide empty sections
    .map(({ title, data }) => ({ title, data: data ?? [] }));

  return (
    <View style={[styles.container, { paddingTop: 10 }]}>
      <Pressable
        onPress={() => router.push("/settings/school")}
        style={{ justifyContent: "flex-start", width: "100%" }}
      >
        <AntDesign
          name="left"
          size={32}
          color={COLORS.textSecondary}
          style={{ marginLeft: 20 }}
        />
      </Pressable>

      <StylizedSearch
        value={searchQuery}
        onChangeText={setSearchQuery}
        label="Search"
        dark={false}
      />

      <View style={styles.memberListBackdrop}>
        <SectionList
          sections={VISIBLE_SECTIONS}
          keyExtractor={(item) => item?._id ?? Math.random().toString()}
          contentContainerStyle={{ padding: 16 }}
          ListFooterComponent={<View />}
          ListFooterComponentStyle={{ height: 50 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleUserInfo(item ?? undefined)}>
              <SchoolMemberCard
                isMember={
                  isStudent(item?.role) ||
                  isParent(item?.role) ||
                  (isAdmin(item?.role) && (item?.approvedAdmin ?? false))
                }
                userPFP={item?.profilePicture}
                name={item?.fullName ?? ""}
                email={item?.email ?? ""}
                onPress={item?._id ? () => handleApprove(item._id) : () => {}}
                approvalCard={
                  !!item?._id && isAdmin(item?.role) && !item?.approvedAdmin
                }
                isHead={
                  !!item &&
                  isHeadAdmin(item?.role) &&
                  !!user?.userData.approvedAdmin
                }
              />
            </TouchableOpacity>
          )}
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

      <UserInfoModal
        visible={!!selectedMember}
        onClose={() => setSelectedMember(undefined)}
        user={selectedMember}
      />
    </View>
  );
}
