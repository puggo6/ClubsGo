import { SmallMemberCard } from "@/components/memberCard";
import Message from "@/components/message";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/messages.styles";
import { AntDesign, Feather } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

dayjs.extend(isToday);

const isWeb = Platform.OS === "web";

export default function InGroupchat() {
  const currentUser = useUserData();
  const insets = useSafeAreaInsets();
  const { groupchatId } = useLocalSearchParams();
  const chatId = groupchatId as Id<"groupChats">;
  const router = useRouter();

  const groupchat = useQuery(api.groupChats.getChatInfo, { id: chatId });
  const handleLeave = useMutation(api.groupChats.exitChat);
  const sendMessage = useMutation(api.groupChats.sendMessage);

  const school = currentUser?.userData.school;

  // ✅ hook always called, not conditionally
  const fullSchool = useQuery(
    api.schools.getSchoolData,
    school?._id ? { schoolId: school._id } : "skip",
  );

  const messages = groupchat?.messages;
  const members = groupchat?.members;

  const [text, setText] = useState("");
  const [membersVisible, setMembersVisible] = useState(false);
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["95%", "50%", "25%"];

  const usersNotInChat = groupchat?.members
    ?.filter((u) => u.user?.currentChat !== groupchatId)
    .map((u) => u.user?._id)
    .filter((id): id is Id<"users"> => !!id);

  // keyboard animation — mobile only
  useEffect(() => {
    if (isWeb) return;

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      Animated.spring(keyboardOffset, {
        toValue: -event.endCoordinates.height,
        speed: 30,
        bounciness: 0,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.spring(keyboardOffset, {
        toValue: 0,
        speed: 30,
        bounciness: 0,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardOffset]);

  const dismissKeyboard = () => {
    if (!isWeb) Keyboard.dismiss();
  };

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage({
      currentDate: dayjs().toISOString(),
      content: text,
      groupChat: chatId,
      usersNotInChat,
    });
    setText("");
    dismissKeyboard();
  };

  const handleBack = () => {
    handleLeave({ chatId: groupchatId as Id<"groupChats"> });
    router.push("/messages");
  };

  const handleOpenSheet = () => {
    if (isWeb) {
      setMembersVisible(true);
    } else {
      bottomSheetRef.current?.expand();
    }
  };

  const MembersList = () => (
    <>
      <Text style={localStyles.membersTitle}>Current Members</Text>
      <FlatList
        data={groupchat?.members}
        keyExtractor={(item) => item.toString()}
        numColumns={isWeb ? 3 : 2}
        renderItem={({ item }) => {
          const u = fullSchool?.users.find((u) => u?._id === item.user?._id);
          return (
            <View style={{ margin: 5 }}>
              <SmallMemberCard
                userPFP={u?.profilePicture}
                name={u?.fullName ?? ""}
                email={""}
                isMember={
                  (u?.role === "student"
                    ? true
                    : u?._id &&
                      currentUser?.userData.school?.adminList?.includes(
                        u._id,
                      )) ?? false
                }
                onPress={() => {}}
                approvalCard={false}
              />
            </View>
          );
        }}
      />
    </>
  );

  if (!currentUser) return <></>;

  // ── web layout ───────────────────────────────────────────────
  if (isWeb) {
    return (
      <View style={localStyles.webContainer}>
        {/* header */}
        <View style={localStyles.webHeader}>
          <TouchableOpacity onPress={handleBack} style={localStyles.backButton}>
            <AntDesign name="left" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Pressable
            onPress={handleOpenSheet}
            style={localStyles.webHeaderInfo}
          >
            <Text style={localStyles.webChatName}>
              {!!groupchat?.club
                ? (groupchat?.name ?? "")
                : (groupchat?.members?.length ?? 0) > 2
                  ? (groupchat?.name ?? "")
                  : (groupchat?.members.find(
                      (m) => m.user?._id !== currentUser.userData._id,
                    )?.user?.fullName ?? "")}
            </Text>
            <Text style={localStyles.webChatSubtext}>
              {groupchat?.members.length} member
              {groupchat?.members.length !== 1 ? "s" : ""} · tap to view
            </Text>
          </Pressable>
        </View>

        <View style={localStyles.webDivider} />

        {/* messages */}
        <View style={{ flex: 1 }}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.dateSent}
            inverted
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: 16,
            }}
            renderItem={({ item, index }) => {
              const user = members?.find((u) => u?.user?._id === item.sender);
              const prevMessage = messages ? messages[index + 1] : undefined;
              const prevUser = prevMessage?.sender;
              const nextUser = messages?.[index - 1]?.sender;
              const newDay = !dayjs(prevMessage?.dateSent).isSame(
                dayjs(item.dateSent),
                "day",
              );
              const dateToday = dayjs(item.dateSent).isToday();
              return (
                <>
                  <Message
                    userName={user?.user?.fullName ?? "Deleted User"}
                    byUser={user?.user?._id === currentUser.userData._id}
                    textMessage={item.message}
                    dateSent={item.dateSent}
                    profilePic={user?.user?.profilePicture ?? ""}
                    currentUser={item.sender}
                    previousUser={prevUser}
                    nextUser={nextUser}
                  />
                  {newDay && (
                    <Text style={localStyles.dateSeparator}>
                      {(dateToday ? "Today, " : "") +
                        dayjs(item.dateSent).format(
                          dateToday ? "MMMM D" : "dddd, MMMM D",
                        )}
                    </Text>
                  )}
                </>
              );
            }}
          />
        </View>

        <View style={localStyles.webDivider} />

        {/* input */}
        <View style={localStyles.webInputRow}>
          <TextInput
            style={localStyles.webTextInput}
            value={text}
            onChangeText={setText}
            placeholder="Enter a message..."
            placeholderTextColor={COLORS.textPlaceholder}
            multiline
            onKeyPress={(e: any) => {
              if (e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) {
                e.preventDefault?.();
                handleSend();
              }
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[
              localStyles.webSendButton,
              { opacity: text.trim() ? 1 : 0.4 },
            ]}
          >
            <Feather name="send" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* members modal */}
        <Modal
          visible={membersVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMembersVisible(false)}
        >
          <Pressable
            style={localStyles.modalBackdrop}
            onPress={() => setMembersVisible(false)}
          >
            <Pressable
              style={localStyles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={localStyles.modalHeader}>
                <Text style={localStyles.membersTitle}>Members</Text>
                <TouchableOpacity onPress={() => setMembersVisible(false)}>
                  <AntDesign
                    name="close"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <MembersList />
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          marginRight: insets.right,
          marginLeft: insets.left,
          flex: 1,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Pressable style={{ flex: 1 }} onPress={dismissKeyboard}>
          <TouchableOpacity
            onPress={handleBack}
            style={{ justifyContent: "flex-start", width: "100%" }}
          >
            <AntDesign
              name="left"
              size={32}
              color={COLORS.textSecondary}
              style={{ marginLeft: 20 }}
            />
          </TouchableOpacity>

          <Pressable onPress={handleOpenSheet}>
            <View style={{ width: "100%", justifyContent: "center" }}>
              <Text style={styles.chatName}>
                {!!groupchat?.club
                  ? (groupchat?.name ?? "")
                  : (groupchat?.members?.length ?? 0 > 2)
                    ? (groupchat?.name ?? "")
                    : (groupchat?.members.find(
                        (m) => m.user?._id !== currentUser.userData._id,
                      )?.user?.fullName ?? "")}
              </Text>
              <Text style={styles.chatSubtext}>
                {groupchat?.members.length} member
                {groupchat?.members.length && groupchat?.members.length > 1
                  ? "s"
                  : ""}
              </Text>
              <View
                style={{
                  width: "100%",
                  backgroundColor: COLORS.textSecondary,
                  height: 1,
                  marginTop: 12,
                }}
              />
            </View>
          </Pressable>

          <View style={{ flex: 1, justifyContent: "flex-start" }}>
            <View style={{ paddingBottom: 20 }}>
              <FlatList
                data={messages}
                keyExtractor={(item) => item.dateSent}
                inverted
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                renderItem={({ item, index }) => {
                  const user = members?.find(
                    (u) => u?.user?._id === item.sender,
                  );
                  const prevMessage = messages
                    ? messages[index + 1]
                    : undefined;
                  const prevUser = prevMessage?.sender;
                  const nextUser = messages?.[index - 1]?.sender;
                  const newDay = !dayjs(prevMessage?.dateSent).isSame(
                    dayjs(item.dateSent),
                    "day",
                  );
                  const dateToday = dayjs(item.dateSent).isToday();
                  return (
                    <>
                      <Message
                        userName={user?.user?.fullName ?? "No name!"}
                        byUser={user?.user?._id === currentUser.userData._id}
                        textMessage={item.message}
                        dateSent={item.dateSent}
                        profilePic={user?.user?.profilePicture ?? ""}
                        currentUser={item.sender}
                        previousUser={prevUser}
                        nextUser={nextUser}
                      />
                      {newDay && (
                        <Text style={localStyles.dateSeparator}>
                          {(dateToday ? "Today, " : "") +
                            dayjs(item.dateSent).format(
                              dateToday ? "MMMM D" : "dddd, MMMM D",
                            )}
                        </Text>
                      )}
                    </>
                  );
                }}
              />
            </View>
          </View>

          <Animated.View
            style={[
              styles.textInputContainer,
              { transform: [{ translateY: keyboardOffset }] },
            ]}
          >
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <TextInput
                style={styles.textInput}
                value={text}
                onChangeText={setText}
                placeholder="Enter a Message..."
                placeholderTextColor={COLORS.textSecondary}
                multiline
              />
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingRight: 30,
                }}
              >
                <TouchableOpacity onPress={handleSend}>
                  <Feather name="send" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        handleIndicatorStyle={{ backgroundColor: COLORS.textSecondary }}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        style={{ backgroundColor: COLORS.surface }}
        backgroundStyle={{ backgroundColor: COLORS.surface, borderRadius: 20 }}
      >
        <BottomSheetView>
          <MembersList />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const localStyles = StyleSheet.create({
  // ── web ──────────────────────────────────────────────────────
  webContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    flexDirection: "column",
  },
  webHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    gap: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceAlternate,
    alignItems: "center",
    justifyContent: "center",
  },
  webHeaderInfo: {
    flex: 1,
  },
  webChatName: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    fontSize: 18,
  },
  webChatSubtext: {
    color: COLORS.textSecondary,
    fontFamily: "PoppinsRegular",
    fontSize: 12,
  },
  webDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceAlternate,
  },
  webInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    gap: 12,
  },
  webTextInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlternate,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontFamily: "OpenSansRegular",
    fontSize: 14,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  webSendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  // ── shared ────────────────────────────────────────────────────
  membersTitle: {
    fontSize: 20,
    fontFamily: "PoppinsBold",
    color: COLORS.textPrimary,
    textAlign: "center",
    paddingVertical: 12,
  },
  dateSeparator: {
    fontSize: 13,
    fontFamily: "OpenSansRegular",
    color: COLORS.textSecondary,
    alignSelf: "center",
    textAlign: "center",
    marginBottom: 15,
  },
  // ── modal ─────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: 480,
    maxHeight: "70%",
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
});
