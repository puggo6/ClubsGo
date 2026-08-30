import CreateGroupchat from "@/components/createGroupchat";
import Divider from "@/components/divider";
import GroupchatCard from "@/components/groupchatCard";
import { WebCreateModal } from "@/components/webCreateModal";
import isWeb from "@/constants/isWeb";
import { isAdmin, isHeadAdmin, isNonAdmin } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/messages.styles";
import { Feather } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function messages() {
  const router = useRouter();
  const currentUser = useUserData();
  const insets = useSafeAreaInsets();
  const handleOpenChat = useMutation(api.groupChats.handleOpenChat);
  const createGroupChat = useMutation(api.groupChats.createChat);
  const exitChat = useMutation(api.users.exitChat);

  const headAdmin =
    isHeadAdmin(currentUser?.userData.role) &&
    currentUser?.userData.approvedAdmin;

  const clubs = useQuery(api.clubs.getClubList, {
    clubList: currentUser?.userData.school?.clubList ?? [],
  });

  const schoolChats = useMemo(
    () =>
      clubs
        ?.map((c) => c.groupChat)
        .filter((c): c is Id<"groupChats"> => c !== undefined) ?? [],
    [clubs],
  );

  const userChatIds = useMemo(
    () =>
      currentUser?.userData.chats
        .map((c) => c?._id)
        .filter((c): c is Id<"groupChats"> => c !== undefined) ?? [],
    [currentUser?.userData.chats],
  );

  // for headAdmin fetch all school chats + their own chats
  const allChatIds = useMemo(() => {
    if (!headAdmin) return userChatIds;
    const combined = new Set([...schoolChats, ...userChatIds]);
    return Array.from(combined);
  }, [headAdmin, schoolChats, userChatIds]);

  const groupChats = useQuery(api.groupChats.getChats, { id: allChatIds });

  // split into user's chats vs other school chats for headAdmin
  const { userChats, otherSchoolChats } = useMemo(() => {
    if (!headAdmin || !groupChats) {
      return { userChats: groupChats ?? [], otherSchoolChats: [] };
    }
    const userChatIdSet = new Set(userChatIds.map((id) => id.toString()));
    const user = groupChats.filter(
      (c) => c?._id && userChatIdSet.has(c._id.toString()),
    );
    const other = groupChats.filter(
      (c) => c?._id && !userChatIdSet.has(c._id.toString()),
    );
    return {
      userChats: user.sort((a, b) =>
        (a?.name ?? "").localeCompare(b?.name ?? ""),
      ),
      otherSchoolChats: other.sort((a, b) =>
        (a?.name ?? "").localeCompare(b?.name ?? ""),
      ),
    };
  }, [groupChats, headAdmin, userChatIds]);

  const sections = useMemo(
    () => [
      { title: "Your Chats", data: userChats },
      ...(headAdmin && otherSchoolChats.length > 0
        ? [{ title: "Other School Chats", data: otherSchoolChats }]
        : []),
    ],
    [userChats, otherSchoolChats, headAdmin],
  );

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [modalVis, setModalVis] = useState(false);

  const handleOpenSheet = () => {
    !isWeb() ? bottomSheetRef.current?.expand() : setModalVis(true);
  };
  const handleCloseSheet = () => {
    !isWeb() ? bottomSheetRef.current?.close() : setModalVis(false);
  };

  useEffect(() => {
    exitChat();
  }, []);

  const handleOpen = (chat: Id<"groupChats">, message: string) => {
    handleOpenChat({ message, groupChat: chat });
    router.push({
      pathname: "/groupchats/inGroupchat",
      params: { groupchatId: chat },
    });
  };

  if (!currentUser) return <></>;

  const snapPoints = ["100", "25%", "50%", "75%"];
  const CustomBackground = ({ style }: BottomSheetBackgroundProps) => (
    <View
      style={[style, { backgroundColor: COLORS.surface, borderRadius: 20 }]}
    />
  );
  type GroupChat = NonNullable<typeof groupChats>[number];
  const renderChatItem = ({ item }: { item: GroupChat }) => {
    if (!item?._id) return null;
    const profiles = (
      item.club
        ? item.members
        : item.members.filter((m) => m.user?._id !== currentUser.userData._id)
    ).map((u) => u?.user?.profilePicture ?? "");
    const sender = item.members.find(
      (u) => u?.user?._id === item.messages?.[0]?.sender,
    );
    const cUser = item.members.find(
      (u) => u?.user?._id === currentUser.userData._id,
    );
    const isNewMessage =
      cUser?.lastRead !== (item.messages?.[0]?.message ?? "");

    return (
      <GroupchatCard
        onPress={() => handleOpen(item._id!, item.messages?.[0]?.message ?? "")}
        name={
          !!item.club
            ? (item.name ?? "")
            : item.members.length > 2
              ? (item.name ?? "")
              : (item.members.find(
                  (m) => m.user?._id !== currentUser.userData._id,
                )?.user?.fullName ?? "")
        }
        profiles={profiles}
        currentUserId={currentUser.userData._id}
        lastMessage={
          (item?.messages?.[0]?.message?.length ?? 0) > 0
            ? item.messages
              ? item.messages[0].message
              : ""
            : "No Previous Messages"
        }

        lastSender={item.messages ? (sender?.user?.fullName ?? "") : ""}
        newMessage={isNewMessage}
        byUser={sender?.user?._id === currentUser.userData._id}
        inClub={currentUser.userData.chats
          .map((c) => c?._id)
          .includes(item._id)}
      />
    );
  };

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => (
    <View style={localStyles.sectionHeader}>
      <View style={styles.divSpace}>
        <Text style={styles.divTitle}>{title}</Text>
        <Divider />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        !isWeb() && {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          marginRight: insets.right,
          marginLeft: insets.left,
        },
        isWeb() && { overflow: "hidden" },
      ]}
      behavior={isWeb() ? undefined : "padding"}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>
      <LinearGradient
        colors={["#12c2e9", "#c471ed", "#f64f59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />

      <View style={{ flex: 1 }}>
        {headAdmin ? (
          <SectionList
            sections={sections}
            keyExtractor={(item, index) =>
              item?._id?.toString() ?? index.toString()
            }
            renderItem={renderChatItem}
            renderSectionHeader={renderSectionHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            stickySectionHeadersEnabled={false}
          />
        ) : (
          <FlatList
            data={groupChats}
            keyExtractor={(item, index) =>
              item?._id?.toString() ?? index.toString()
            }
            renderItem={renderChatItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )}
      </View>

      {isNonAdmin(currentUser.userData.role) ||
        (isAdmin(currentUser.userData.role) &&
          currentUser.userData.approvedAdmin && (
            <TouchableOpacity
              onPress={handleOpenSheet}
              activeOpacity={0.5}
              style={localStyles.fab}
            >
              <View style={styles.createButton}>
                <Feather name="plus" size={40} color="white" />
              </View>
            </TouchableOpacity>
          ))}

      {!isWeb() ? (
        <BottomSheet
          handleIndicatorStyle={{ backgroundColor: COLORS.textSecondary }}
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          style={{ backgroundColor: COLORS.surface }}
          backgroundStyle={{
            backgroundColor: COLORS.surface,
            borderRadius: 20,
          }}
          backgroundComponent={CustomBackground}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
        >
          <BottomSheetView style={{ paddingBottom: 30 }}>
            <CreateGroupchat onCreate={handleCloseSheet} />
          </BottomSheetView>
        </BottomSheet>
      ) : (
        <WebCreateModal
          visible={modalVis}
          title="Create Groupchat"
          onClose={handleCloseSheet}
        >
          <CreateGroupchat onCreate={handleCloseSheet} />
        </WebCreateModal>
      )}
    </KeyboardAvoidingView>
  );
}

const localStyles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 80,
    right: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontFamily: "PoppinsMedium",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceAlternate,
  },
});
