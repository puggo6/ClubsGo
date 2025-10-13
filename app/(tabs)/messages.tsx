import CreateGroupchat from "@/components/createGroupchat";
import GroupchatCard from "@/components/groupchatCard";
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
import React, { useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList, Pressable } from "react-native-gesture-handler";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function messages() {
  const router = useRouter();
  const currentUser = useUserData();
  const insets = useSafeAreaInsets();
  const handleOpenChat = useMutation(api.groupChats.handleOpenChat);
  const [chatName, setName] = useState("PC");
  const createGroupChat = useMutation(api.groupChats.createChat);

  const chatIds = currentUser?.userData.chats
    .map((c) => c?._id)
    .filter((c) => c !== undefined);
  const groupChats = useQuery(api.groupChats.getChats, { id: chatIds ?? [] });
  const bottomSheetRef = useRef<BottomSheet>(null);
  const handleOpenSheet = () => {
    bottomSheetRef.current?.expand(); // opens to the first snap point
  };
  const handleCloseSheet = () => {
    bottomSheetRef.current?.close(); // opens to the first snap point
  };
  if (!currentUser) return <></>;

  const handleCreate = () => {
    createGroupChat({ users: [currentUser?.userData._id], name: chatName });
  };
  const handleOpen = (chat: Id<"groupChats">, message: string) => {
    handleOpenChat({ message, groupChat: chat });
    router.push({
      pathname: "/groupchats/inGroupchat",
      params: { groupchatId: chat },
    });
  };
  const snapPoints = ["100", "25%", "50%", "75%"];
  const CustomBackground = ({ style }: BottomSheetBackgroundProps) => (
    <View
      style={[
        style,
        {
          backgroundColor: COLORS.surface,
          borderRadius: 20,
        },
      ]}
    />
  );
  const screenWidth = Dimensions.get("window").width;

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          marginRight: insets.right,
          marginLeft: insets.left,
        },
      ]}
      behavior={"padding"}
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
      <View
        style={{
          flex: 1,
        }}
      >
        <FlatList
          data={groupChats}
          keyExtractor={(item, index) =>
            item?._id?.toString() ?? index.toString()
          }
          renderItem={({ item }) => {
            const profiles = item.members.map(
              (u) => u?.user?.profilePicture ?? ""
            );
            const sender = item.members.find(
              (u) => u?.user?._id === item.messages?.[0]?.sender
            );
            const cUser = item.members.find(
              (u) => u?.user?._id === currentUser.userData._id
            );
            const isNewMessage =
              cUser?.lastRead !== (item.messages?.[0]?.message ?? "");
            if (item._id === undefined) return <></>;
            return (
              <Pressable
                onPress={() =>
                  handleOpen(item._id!, item.messages?.[0]?.message ?? "")
                }
              >
                <GroupchatCard
                  onPress={() => {}}
                  name={item.name ?? ""}
                  profiles={profiles}
                  currentUserId={currentUser.userData._id}
                  lastMessage={item.messages ? item.messages[0]?.message : ""}
                  lastSender={
                    item.messages ? (sender?.user?.fullName ?? "") : ""
                  }
                  newMessage={isNewMessage}
                  byUser={sender?.user?._id === currentUser.userData._id}
                />
              </Pressable>
            );
          }}
        />
      </View>
      <View
        style={{
          alignItems: "flex-end",
          justifyContent: "flex-end",
          flex: 1,
          marginBottom: 80,
        }}
      >
        <TouchableOpacity onPress={handleOpenSheet} activeOpacity={0.5}>
          <View style={[styles.createButton]}>
            <Feather name="plus" size={40} color="white" />
          </View>
        </TouchableOpacity>
      </View>

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
    </KeyboardAvoidingView>
  );
}
