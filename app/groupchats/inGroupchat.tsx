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
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function inGroupchat() {
  const currentUser = useUserData();
  const insets = useSafeAreaInsets();
  const currendDate = dayjs();
  const { groupchatId } = useLocalSearchParams();
  const chatId = groupchatId as Id<"groupChats">;
  const groupchat = useQuery(api.groupChats.getChatInfo, {
    id: chatId,
  });
  const handleLeave = useMutation(api.groupChats.exitChat);
  var isToday = require("dayjs/plugin/isToday");
  dayjs.extend(isToday);
  const messages = groupchat?.messages;
  const members = groupchat?.members;
  const sendMessage = useMutation(api.groupChats.sendMessage);
  const [text, setText] = useState("");
  const handleSend = () => {
    sendMessage({
      currentDate: dayjs().toISOString(),
      content: text,
      groupChat: chatId,
    });
    setText("");
    Keyboard.dismiss();
  };
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["95%", "50%, 25%"];
  const handleOpenSheet = () => {
    bottomSheetRef.current?.expand(); // opens to the first snap point
  };
  const handleCloseSheet = () => {
    bottomSheetRef.current?.close(); // opens to the first snap point
  };
  const handleBack = () => {
    handleLeave({ chatId: groupchatId as Id<"groupChats"> });
    router.back();
  };
  if (!currentUser) return <></>;
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
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={"padding"}
      >
        <TouchableOpacity
          onPress={() => {
            handleBack();
          }}
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
            <Text style={styles.chatName}>{groupchat?.name}</Text>
            <Text style={styles.chatSubtext}>
              {"" +
                groupchat?.members.length +
                " member" +
                (groupchat?.members.length && groupchat?.members.length > 1
                  ? "s"
                  : "")}
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
        <View
          style={{
            flex: 1,
            justifyContent: "flex-start",
          }}
        >
          <View style={{ paddingBottom: 20 }}>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.dateSent}
              inverted
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => {
                const user = members?.find((u) => u?.user?._id === item.sender);
                const prevMessage = messages ? messages[index + 1] : undefined;
                const prevUser =
                  (prevMessage ? prevMessage.sender : undefined) ?? undefined;
                const nextUser = messages
                  ? messages[index - 1]
                    ? messages[index - 1].sender
                    : undefined
                  : undefined;
                const newDay = !dayjs(prevMessage?.dateSent).isSame(
                  dayjs(item.dateSent),
                  "day"
                );
                const dateToday = dayjs(item.dateSent).isToday();
                return (
                  <>
                    <Message
                      userName={user?.user?.fullName ?? "No name!"}
                      byUser={user?.user?._id == currentUser.userData._id}
                      textMessage={item.message}
                      dateSent={item.dateSent}
                      profilePic={user?.user?.profilePicture ?? ""}
                      currentUser={item.sender}
                      previousUser={prevUser}
                      nextUser={nextUser}
                    />
                    {newDay && (
                      <View>
                        <Text
                          style={{
                            fontSize: 15,
                            fontFamily: "OpenSansRegular",
                            color: COLORS.textSecondary,
                            alignSelf: "center",
                            textAlign: "center",
                            marginBottom: 15,
                          }}
                        >
                          {(dateToday ? "Today, " : "") +
                            dayjs(item.dateSent).format(
                              dateToday ? "MMMM D" : "dddd, MMMM D"
                            )}
                        </Text>
                      </View>
                    )}
                  </>
                );
              }}
            />
          </View>
        </View>

        <View style={styles.textInputContainer}>
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
        </View>
      </KeyboardAvoidingView>
      <BottomSheet
        ref={bottomSheetRef}
        handleIndicatorStyle={{ backgroundColor: COLORS.textSecondary }}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        style={{ backgroundColor: COLORS.surface }}
        backgroundStyle={{
          backgroundColor: COLORS.surface,
          borderRadius: 20,
        }}
      >
        <BottomSheetView>
          <></>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

/*
<View
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            alignItems: "flex-end",
            paddingRight: 20,
            top: 20,
          }}
        >
          <Feather name="send" size={24} color={COLORS.textPrimary} />
        </View>

         <Message
          textMessage="Hello Guys! Hello Guys!Hello Guys!Hello Guys!Hello Guys!Hello Guys!Hello Guys!Hello Guys!Hello Guys!Hello Guys!Hello Guys!Hello Guys!Hello Guys!"
          byUser={true}
          userName={currentUser.fullName}
        />
        <Message
          textMessage="Yo Yo Yo"
          byUser={false}
          userName={currentUser.fullName}
        />
*/
