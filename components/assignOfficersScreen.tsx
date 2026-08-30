import { isStudent } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import Divider from "./divider";
import GradientButton from "./gradientButton";
import { OfficerMemberCard } from "./memberCard";

export type Member = {
  user: Doc<"users">;
  dateJoined: string;
  role?: string;
};

type props = {
  club: Id<"clubs">;
  clubName: string;
  allMembers?: Member[];
  close: () => void;
  clubRoles?: string[];
};

export default function AssignOfficersScreen({
  club,
  clubName,
  allMembers,
  close,
  clubRoles,
}: props) {
  const editRole = useMutation(api.clubs.updateMemberRole);
  const handleSaveChanges = async () => {
    if (!selectedMember) {
      return;
    }

    await editRole({
      role: selectedRole,
      userId: selectedMember.user._id,
      clubId: club,
    });

    const updatedMember = {
      ...selectedMember,
      role: selectedRole,
    };

    setOfficers((prevOfficers) => {
      const withoutSelected = prevOfficers.filter(
        (member) => member.user._id !== selectedMember.user._id,
      );

      return selectedRole
        ? [...withoutSelected, updatedMember]
        : withoutSelected;
    });

    setNonOfficers((prevNonOfficers) => {
      const withoutSelected = prevNonOfficers.filter(
        (member) => member.user._id !== selectedMember.user._id,
      );

      return selectedRole
        ? withoutSelected
        : [...withoutSelected, updatedMember];
    });

    setSelectedMember(undefined);
    setSelectedRole(undefined);
  };

  const [officers, setOfficers] = useState<Member[]>([]);
  const [nonOfficers, setNonOfficers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | undefined>(
    undefined,
  );
  const addOfficer = (officer: Member) => {
    setOfficers([...officers, officer]);
    setNonOfficers(nonOfficers.filter((m) => m.user._id !== officer.user._id));
  };
  const removeOfficer = (officer: Member) => {
    setOfficers(officers.filter((m) => m.user._id !== officer.user._id));
    setNonOfficers([...nonOfficers, officer]);
  };
  const handleSelect = (member: Member) => {
    setSelectedMember(member);
    setOfficers(officers.filter((m) => m.user._id !== member.user._id));
    setNonOfficers(nonOfficers.filter((m) => m.user._id !== member.user._id));
  };
  const handleDeselect = (member: Member) => {
    setSelectedMember(undefined);
    setSelectedRole(undefined);
    member.role
      ? setOfficers([...officers, member])
      : setNonOfficers([...nonOfficers, member]);
  };
  const [roles, setRoles] = useState<string[]>(clubRoles ?? []);
  const [selectedRole, setSelectedRole] = useState<string | undefined>(
    undefined,
  );
  useEffect(() => {
    const filteredMembers =
      allMembers?.filter((member) => isStudent(member.user.role)) ?? [];

    setOfficers(filteredMembers.filter((member) => member.role));
    setNonOfficers(filteredMembers.filter((member) => !member.role));
  }, [allMembers]);

  useEffect(() => {
    setRoles(clubRoles ?? []);
  }, [clubRoles]);

  const OFFICER_DATA = [
    {
      title: "Current Officers",
      data: officers,
    },
    {
      title: "Other Members",
      data: nonOfficers,
    },
  ];
  const availableRoles = roles.filter(
    (r) => !allMembers?.map((m) => m.role).includes(r),
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {"Assign " + clubName.trim() + "'s Officers"}
        </Text>
      </View>
      <View
        onStartShouldSetResponder={() => true}
        style={{ flex: 1, paddingVertical: 16 }}
      >
        <Text style={styles.subHeaderText}>
          {selectedMember ? "Selected Member" : "No Member Currently Selected"}
        </Text>
        <View style={{ width: "100%" }}>
          {selectedMember && (
            <>
              <OfficerMemberCard
                email={selectedMember?.user.email ?? ""}
                userPFP={selectedMember?.user.profilePicture}
                name={selectedMember?.user.fullName ?? ""}
                onPress={() => handleDeselect(selectedMember)}
                role={selectedMember.role}
                dateJoined={selectedMember.dateJoined}
                isEditing={true}
              />

              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Text style={styles.sectionText}>Selected Role: </Text>
                <Pressable onPress={() => setSelectedRole(undefined)}>
                  {selectedRole ? (
                    <View style={[styles.tagBack, { marginVertical: 0 }]}>
                      <Text
                        style={[
                          styles.selectedTagText,
                          {
                            color: COLORS.primary,
                          },
                        ]}
                      >
                        {selectedRole}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.selectedTagText]}>{"None"}</Text>
                  )}
                </Pressable>
              </View>
              <Text style={styles.sectionText}>All Roles</Text>
              <View style={styles.roleContainer}>
                <View style={styles.tagSelection}>
                  {roles?.map((role) => (
                    <Pressable
                      key={role}
                      onPress={() =>
                        availableRoles.includes(role)
                          ? selectedRole === role
                            ? setSelectedRole(undefined)
                            : setSelectedRole(role)
                          : void {}
                      }
                    >
                      <View style={styles.tagBack}>
                        <Text
                          style={[
                            styles.tagText,
                            {
                              color: !availableRoles.includes(role)
                                ? COLORS.textSecondary
                                : styles.tagText.color,
                            },
                          ]}
                        >
                          {role}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                  {roles?.length === 0 && (
                    <View
                      style={[
                        styles.tagBack,
                        { backgroundColor: "transparent" },
                      ]}
                    >
                      <Text style={styles.tagText}> </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <GradientButton
                  onPress={handleSaveChanges}
                  title="Save Changes"
                  fixSpacing={true}
                />
              </View>
            </>
          )}
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <SectionList
              sections={OFFICER_DATA}
              keyExtractor={(item) => item.user._id.toString()}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <View>
                  <OfficerMemberCard
                    email={item?.user.email ?? ""}
                    userPFP={item?.user.profilePicture}
                    name={item?.user.fullName ?? ""}
                    onPress={() => handleSelect(item)}
                    role={item.role}
                    dateJoined={item.dateJoined}
                  />
                </View>
              )}
              renderSectionHeader={({ section: { title } }) => (
                <>
                  <View style={styles.divSpace}>
                    <Text style={styles.divTitle}>{title}</Text>
                    <Divider />
                  </View>
                </>
              )}
              horizontal={false} //
              scrollEnabled={true}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
      </View>
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
