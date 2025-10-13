import { SchoolMemberCard } from "@/components/memberCard";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/settings.styles";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React from "react";
import { SectionList, Text, View } from "react-native";

export default function fullSchoolUsers() {
  const user = useUserData();
  const router = useRouter();

  const school = user?.userData.school;
  let fullSchool = undefined;
  if (school?._id) {
    fullSchool = useQuery(api.schools.getSchoolData, { schoolId: school?._id });
  }
  const approveUser = useMutation(api.schools.approveJoinRequest);
  if (!school?._id) return;

  const handleApprove = (user: Id<"users">) => {
    approveUser({ userId: user, schoolId: school?._id });
  };
  const MEMBERDATA = [
    {
      title: "Approved Admins",
      data: fullSchool?.adminList,
    },
    {
      title: "Pending Admins",
      data: fullSchool?.pendingAdminList,
    },
    {
      title: "Students",
      data: fullSchool?.users.filter((u) => u?.role === "student"),
    },
  ];
  const VISIBLE_SECTIONS = MEMBERDATA.map(({ title, data }) => ({
    title,
    data: data ?? [],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.memberListBackdrop}>
        <SectionList
          sections={VISIBLE_SECTIONS}
          keyExtractor={(item) => item?._id ?? Math.random().toString()}
          contentContainerStyle={{ padding: 16 }}
          ListFooterComponent={<View />}
          ListFooterComponentStyle={{ height: 50 }}
          renderItem={({ item }) => {
            return (
              <SchoolMemberCard
                isMember={
                  (item?.role === "student"
                    ? true
                    : item?._id && school?.adminList?.includes(item?._id)) ??
                  false
                }
                userPFP={item?.profilePicture}
                name={item?.fullName ?? ""}
                email={item?.email ?? ""}
                onPress={
                  item?._id
                    ? () => {
                        handleApprove(item._id);
                      }
                    : () => {}
                }
                approvalCard={
                  (item &&
                    item._id &&
                    school?.pendingAdminList?.includes(item?._id)) ??
                  true
                }
              />
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
  );
}
