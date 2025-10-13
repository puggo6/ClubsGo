import { COLORS } from "@/constants/theme";
import { Id } from "@/convex/_generated/dataModel";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type props = {
  userName: string;
  byUser: boolean;
  textMessage: string;
  dateSent: string;
  profilePic: string;
  currentUser: Id<"users">;
  previousUser?: Id<"users">;
  nextUser?: Id<"users">;
};

export default function message({
  byUser,
  textMessage,
  userName,
  dateSent,
  profilePic,
  currentUser,
  previousUser,
  nextUser,
}: props) {
  dayjs.extend(isToday);
  const consecutive = currentUser === nextUser;
  const firstMessage = consecutive && currentUser !== previousUser;

  const date = dayjs(dateSent);
  const formDate = date.format("h:mm");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!imageUrl && profilePic) {
      setImageUrl(profilePic);
    }
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        marginTop: 0,
        marginBottom: consecutive ? 4 : 15,
      }}
    >
      {!byUser && imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.userAvatar} />
      )}
      <View
        style={[
          styles.container,
          {
            alignItems: byUser ? "flex-end" : "flex-start",
          },
        ]}
      >
        <View
          style={[
            styles.messageContainer,
            {
              marginLeft: byUser ? 90 : 0,
              marginRight: !byUser ? 90 : 15,

              borderBottomLeftRadius: byUser ? 20 : consecutive ? 20 : 5,

              borderBottomRightRadius: !byUser ? 20 : consecutive ? 20 : 5,
              backgroundColor: byUser
                ? "#2563EB"
                : styles.messageContainer.backgroundColor,
            },
          ]}
        >
          {!byUser && (
            <View style={styles.nameContainer}>
              <Text style={styles.nameText}>{userName}</Text>
            </View>
          )}
          <Text style={styles.messageText}>{textMessage}</Text>
          <Text style={styles.dateText}>{formDate}</Text>
        </View>
      </View>
      {byUser && imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.userAvatar} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  messageContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    alignItems: "flex-start",
  },
  messageText: {
    fontSize: 17,
    color: COLORS.textPrimary,
    fontFamily: "LatoRegular",
    textAlign: "left",
  },
  dateText: {
    color: COLORS.textSecondary,
    fontFamily: "InterMediun",
    fontSize: 12,
    textAlign: "right",
  },
  nameText: {
    color: COLORS.textSecondary,
    fontFamily: "InterMediun",
    fontSize: 12,
    textAlign: "left",
  },
  nameContainer: {
    marginBottom: 4,
    width: "100%",
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 12,
    marginRight: 8,
    bottom: 9,
  },
});
