import { isAdmin } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import { Image } from "expo-image";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  user: Doc<"users"> | null | undefined;
  clubRole?: string; // their role in the specific club (officer title etc)
  dateJoined?: string; // date joined the club
  isAdvisor?: boolean;
};

export default function UserInfoModal({
  visible,
  onClose,
  user,
  clubRole,
  dateJoined,
  isAdvisor,
}: Props) {
  if (!user) return null;
  let parents = useQuery(api.users.getManyUsers, {
    users: user.approvedParents,
  });

  const InfoRow = ({
    icon,
    label,
    value,
    valueColor,
    showDiv,
  }: {
    icon: string;
    label: string;
    value: string;
    valueColor?: string;
    showDiv?: boolean;
  }) => (
    <View
      style={[styles.infoRow, !showDiv && { borderBottomColor: "transparent" }]}
    >
      <View style={styles.infoRowLeft}>
        <Ionicons
          name={icon as any}
          size={16}
          color={COLORS.textMuted}
          style={styles.infoIcon}
        />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : {}]}>
        {value}
      </Text>
    </View>
  );

  const roleColor = () => {
    switch (user.role) {
      case "student":
        return COLORS.primary;
      case "administrator":
        return COLORS.accentA;
      case "superAdmin":
        return COLORS.accentB;
      case "parent":
        return COLORS.open;
      default:
        return COLORS.textMuted;
    }
  };

  const roleLabel = () => {
    switch (user.role) {
      case "student":
        return "Student";
      case "administrator":
        return "Administrator";
      case "superAdmin":
        return "Head Administrator";
      case "parent":
        return "Parent";
      default:
        return "No Role";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* close button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={18} color={COLORS.textSecondary} />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* avatar + name */}
            <View style={styles.header}>
              {user.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {user.fullName?.charAt(0).toUpperCase() ?? "?"}
                  </Text>
                </View>
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={styles.name}>{user.fullName}</Text>

                <TouchableOpacity style={styles.messageIcon} onPress={() => {}}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* role badge */}
              <View
                style={[
                  styles.roleBadge,
                  {
                    borderColor:
                      isAdmin(user.role) && !user.approvedAdmin
                        ? COLORS.userColor
                        : roleColor(),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    {
                      color:
                        isAdmin(user.role) && !user.approvedAdmin
                          ? COLORS.userColor
                          : roleColor(),
                    },
                  ]}
                >
                  {roleLabel() +
                    (isAdmin(user.role) && !user.approvedAdmin
                      ? " - Pending"
                      : "")}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* club-specific info */}
            {(clubRole || isAdvisor || dateJoined) && (
              <>
                <Text style={styles.sectionTitle}>Club Info</Text>
                {isAdvisor && (
                  <InfoRow
                    icon="shield-checkmark-outline"
                    label="Position"
                    value="Advisor"
                    valueColor={COLORS.accentA}
                    showDiv={!!clubRole || !!dateJoined}
                  />
                )}
                {clubRole && (
                  <InfoRow
                    icon="podium-outline"
                    label="Officer Role"
                    value={clubRole}
                    valueColor={COLORS.primary}
                    showDiv={!!dateJoined}
                  />
                )}
                {dateJoined && (
                  <InfoRow
                    icon="calendar-outline"
                    label="Joined Club"
                    value={dayjs(dateJoined).format("MMMM D, YYYY")}
                  />
                )}
                <View style={styles.divider} />
              </>
            )}

            {/* general info */}
            <Text style={styles.sectionTitle}>General</Text>
            <InfoRow
              icon="mail-outline"
              label="Email"
              value={user.email ?? "—"}
              showDiv
            />
            {user.gradeLevel && (
              <InfoRow
                icon="school-outline"
                label="Grade"
                value={`Grade ${user.gradeLevel}`}
                showDiv
              />
            )}
            <InfoRow
              icon="albums-outline"
              label="Clubs"
              value={`${user.clubs?.length ?? 0} club${(user.clubs?.length ?? 0) !== 1 ? "s" : ""}`}
            />

            {/* parent info */}
            {user.role === "student" && (parents?.users.length ?? 0) > 0 && (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Parents</Text>
                <InfoRow
                  icon="people-outline"
                  label="Linked Parents"
                  value={`${user.approvedParents?.length ?? 0} parent${(user.approvedParents?.length ?? 0) !== 1 ? "s" : ""}`}
                />
                {parents?.users?.map((parent) => (
                  <View key={parent?._id} style={styles.parentRow}>
                    {parent?.profilePicture ? (
                      <Image
                        source={{ uri: parent.profilePicture }}
                        style={styles.parentAvatar}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.parentAvatarFallback}>
                        <Text style={styles.parentInitial}>
                          {parent?.fullName?.charAt(0).toUpperCase() ?? "?"}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text style={styles.parentName}>{parent?.fullName}</Text>
                      <Text style={styles.parentEmail}>{parent?.email}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* parent-specific */}
            {user.role === "parent" && (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Children</Text>
                <InfoRow
                  icon="people-outline"
                  label="Linked Children"
                  value={`${user.approvedChildren?.length ?? 0} child${(user.approvedChildren?.length ?? 0) !== 1 ? "ren" : ""}`}
                />
              </>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    width: 340,
    maxHeight: "80%",
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceAlternate,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  header: {
    alignItems: "center",
    paddingBottom: 16,
    gap: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 4,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceAlternate,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarInitial: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    fontSize: 32,
  },
  name: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    fontSize: 20,
    textAlign: "center",
  },
  username: {
    color: COLORS.textMuted,
    fontFamily: "PoppinsRegular",
    fontSize: 13,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  roleText: {
    fontFamily: "PoppinsMedium",
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceAlternate,
    marginVertical: 14,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoIcon: {
    width: 20,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontFamily: "PoppinsRegular",
    fontSize: 13,
  },
  infoValue: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsMedium",
    fontSize: 13,
    maxWidth: 160,
    textAlign: "right",
  },
  parentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  parentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  parentAvatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceAlternate,
    alignItems: "center",
    justifyContent: "center",
  },
  parentInitial: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    fontSize: 14,
  },
  parentName: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsMedium",
    fontSize: 13,
  },
  parentEmail: {
    color: COLORS.textMuted,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
  },
  messageIcon: {
    position: "absolute",
    right: -40,

    width: 28,
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceAlternate,
    alignItems: "center",
    justifyContent: "center",
  },
});
