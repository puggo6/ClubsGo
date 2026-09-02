import { isHeadAdmin } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Divider from "./divider";
import GradientButton from "./gradientButton";
import { OfficerMemberCard } from "./memberCard";
import { StylizedSearch } from "./stylizedInput";

type props = {
  clubMembers: Id<"users">[];
  clubId?: Id<"clubs">;
};

export default function AssignAdvisorsScreen({ clubMembers, clubId }: props) {
  const user = useUserData();
  const currentDate = String(dayjs());
  const assignAdvisors = useMutation(api.users.assignAdvisors);

  const school = user?.userData.school;
  let fullSchool = undefined;
  if (school?._id) {
    fullSchool = useQuery(api.schools.getSchoolData, { schoolId: school?._id });
  }
  const allAdmins = [
    ...(fullSchool?.users.filter((u) => isHeadAdmin(u?.role)) ?? []),
    ...(fullSchool?.adminList ?? []),
  ];
  const [filteredAdmins, setFilteredAdmins] = useState(
    allAdmins.filter((u) => u?._id && !clubMembers.includes(u?._id))
  );
  useEffect(() => {
    setFilteredAdmins(
      allAdmins.filter((u) => u?._id && !clubMembers.includes(u?._id))
    );
  }, [fullSchool]);

  const [selectedUsers, setSelectedUsers] = useState<
    Doc<"users">[] | undefined
  >(undefined);
  const handleAssign = () => {
    if (clubId) {
      assignAdvisors({
        clubId,
        currentDate,
        advisorIds: selectedUsers?.map((u) => u._id) ?? [],
      });
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const searchedAdmins = useMemo(() => {
    return filteredAdmins.filter(
      (u) =>
        searchQuery.length === 0 ||
        u?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, filteredAdmins]);

  const handleSelectUser = (user: Doc<"users">) => {
    setSelectedUsers([...(selectedUsers ?? []), user]);
    setFilteredAdmins(filteredAdmins.filter((u) => u?._id !== user._id));
  };

  const deselectUser = (user: Doc<"users">) => {
    setSelectedUsers(selectedUsers?.filter((u) => u._id !== user._id));
    setFilteredAdmins([user, ...filteredAdmins]);
  };

  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      {(selectedUsers?.length ?? 0) > 0 && (
        <>
          <FlatList
            data={selectedUsers}
            keyExtractor={(item) =>
              item?._id.toString() ?? Math.random.toString()
            }
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View>
                <OfficerMemberCard
                  email={item?.email ?? ""}
                  userPFP={item?.profilePicture}
                  name={item?.fullName ?? ""}
                  onPress={item ? () => deselectUser(item) : () => {}}
                  role={isHeadAdmin(item?.role) ? "Head Admin" : "Admin"}
                  isEditing={true}
                />
              </View>
            )}

            horizontal={false} //
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
          />

          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <GradientButton
              onPress={handleAssign}
              title="Confirm"
              fixSpacing={true}
            />
          </View>
        </>
      )}
      <View style={styles.divSpace}>
        <Text style={styles.divTitle}>All Admins</Text>
        <Divider />
      </View>

      <StylizedSearch
        onChangeText={setSearchQuery}
        value={searchQuery}
        placeholder="Search"
        dark={false}
      />
      <FlatList
        data={searchedAdmins}
        keyExtractor={(item) => item?._id.toString() ?? Math.random.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View>
            <OfficerMemberCard
              email={item?.email ?? ""}
              userPFP={item?.profilePicture}
              name={item?.fullName ?? ""}
              onPress={item ? () => handleSelectUser(item) : () => {}}
              role={isHeadAdmin(item?.role) ? "Head Admin" : "Admin"}
            />
          </View>
        )}

        horizontal={false} //
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 24,
    fontFamily: "PoppinsSemiBold",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  subHeaderText: {
    fontSize: 20,
    fontFamily: "OpenSansRegular",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: 0,
    marginVertical: 10,
  },
  currRoleText: {
    fontFamily: "PoppinsMedium",
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  sectionText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    marginBottom: 2,
    fontFamily: "InterRegular",
    paddingHorizontal: 2,
  },
  roleContainer: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    fontSize: 16,
    color: "#fff",
  },
  tagBack: {
    backgroundColor: "#2F2F3B",
    paddingHorizontal: 3,
    paddingVertical: 3,
    alignSelf: "flex-start",
    borderRadius: 6,
    marginRight: 0,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 3,
  },
  tagText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontFamily: "InterRegular",
  },
  selectedTagText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
  },
  tagSelection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginVertical: 2,
    justifyContent: "center",
  },
  divSpace: {
    paddingVertical: 5,
    paddingHorizontal: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  divTitle: {
    fontSize: 28,
    color: COLORS.white,
    marginBottom: 0,
    marginTop: 0,
    fontFamily: "PoppinsMedium",
  },
});
