import { COLORS } from "@/constants/theme";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
type props = {
  onPress: () => void;
  currentUserId: Id<"users">;
  name: string;
  profiles: string[];
  lastMessage: string;
  lastSender: string;
  newMessage: boolean;
  byUser: boolean;
  inClub: boolean;
};
export default function GroupchatCard({
  onPress,
  currentUserId,
  name,
  profiles,
  lastMessage,
  lastSender,
  newMessage,
  byUser,
  inClub = true,
}: props) {
  const profilePics = profiles.filter((u) => u !== currentUserId);
  const [image0Url, setImage0Url] = useState("");
  useEffect(() => {
    if (profilePics[0]) {
      setImage0Url(profilePics[0]);
    }
  }, [profilePics]);
  const [image1Url, setImage1Url] = useState("");
  useEffect(() => {
    if (profilePics[1]) {
      setImage1Url(profilePics[1]);
    }
  }, [profilePics]);
  const [image2Url, setImage2Url] = useState("");
  useEffect(() => {
    if (profilePics[2]) {
      setImage2Url(profilePics[2]);
    }
  }, [profilePics]);
  const [image3Url, setImage3Url] = useState("");
  useEffect(() => {
    if (profilePics[3]) {
      setImage3Url(profilePics[3]);
    }
  }, [profilePics]);

  const Profiles = () => {
    let num = 0;
    if (image0Url) num++;
    if (image1Url) num++;
    if (image2Url) num++;
    if (image3Url) num++;
    return (
      <View
        style={{
          marginRight: 12,
          justifyContent: "center",
          alignItems: "center",
          width: 50,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {image0Url ? (
            <Image
              source={{ uri: image0Url }}
              style={[
                styles.userAvatar,
                {
                  width: image1Url ? 28 : 36,
                  right: image1Url ? -4 : 0,
                  zIndex: 1,
                },
              ]}
            />
          ) : (
            <></>
          )}
          {image1Url ? (
            <Image
              source={{ uri: image1Url }}
              style={[styles.userAvatar, { width: 28, left: -4, zIndex: 2 }]}
            />
          ) : (
            <></>
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            top: -8,
          }}
        >
          {image2Url ? (
            <Image
              source={{ uri: image2Url }}
              style={[
                styles.userAvatar,
                {
                  width: 28,
                  right: image3Url ? -4 : 0,
                  zIndex: 3,
                },
              ]}
            />
          ) : (
            <></>
          )}
          {image3Url ? (
            <Image
              source={{ uri: image3Url }}
              style={[styles.userAvatar, { width: 28, left: -4, zIndex: 4 }]}
            />
          ) : (
            <></>
          )}
        </View>
      </View>
    );
  };
  return (
    <Pressable onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.componentsContainer}>
          <View style={styles.imgContainer}>
            <Profiles />
          </View>
          <View style={{ flexDirection: "column", marginRight: 50 }}>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.clubName}>{name}</Text>
              {inClub && newMessage && (
                <View style={{}}>
                  <View
                    style={{
                      aspectRatio: 1,
                      width: 10,
                      backgroundColor: COLORS.accentB,
                      borderRadius: 100,
                    }}
                  />
                </View>
              )}
            </View>
            {
              <Text
                style={[
                  styles.clubInfo,
                  {
                    fontFamily:
                      inClub && newMessage ? "OpenSansBold" : "OpenSansRegular",
                    color:
                      inClub && newMessage
                        ? COLORS.textPrimary
                        : COLORS.textSecondary,
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {(!!lastMessage && lastMessage !== "No Previous Messages"
                  ? !byUser
                    ? getFirstName(lastSender) + ": "
                    : ""
                  : "") + (lastMessage ?? "")}
              </Text>
            }
          </View>
        </View>
        <View
          style={{
            width: "90%",
            height: 1,
            backgroundColor: COLORS.textMuted,
            alignSelf: "center",
          }}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 25,
    paddingHorizontal: 13,

    marginBottom: 15,

    justifyContent: "flex-start",
    ...Platform.select({
      web: {
        width: "100%", // Use full width on web
        maxWidth: 900, // Optional max to avoid stretching too far
        alignSelf: "center",
      },
      default: {
        width: "100%",
      },
    }),
  },
  clubName: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    fontSize: 24,
    marginBottom: 0,

    paddingRight: 6,
    ...Platform.select({
      web: {
        width: "100%",
      },
      default: {
        width: 200,
      },
    }),
  },

  clubInfo: {
    color: COLORS.textSecondary,
    fontFamily: "OpenSansMedium",
    fontSize: 14,
  },
  bottomMargin: {
    height: 0,
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    height: 85,
  },
  imgContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  componentsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 15,
  },
  tagsContainer: {
    alignItems: "center",
    paddingTop: 5,
    flexDirection: "column",
    justifyContent: "flex-start",
    width: 90,
    height: 85,
  },
  expandedContent: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  descriptionText: {
    fontSize: 12,
    fontFamily: "OpenSansLight",
    lineHeight: 16,
    color: COLORS.textPrimary,
    marginVertical: 2.5,
    textAlign: "center",
    paddingBottom: 4,
    alignSelf: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#D9D9D9",
    marginVertical: 10,
    width: "100%",
  },
  clubText: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginTop: 3.5,
  },
  restrictedContainer: {
    width: 30,
    aspectRatio: 1,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceIcon,
    borderRadius: 40,
    right: -6,
    top: -6,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,

    shadowColor: "#000",
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  titleText: {
    alignItems: "center",
    justifyContent: "center",

    minHeight: 32,
  },
  userAvatar: {
    width: 36,
    aspectRatio: 1,
    borderRadius: 90,
  },
  otherContentContainer: {
    flex: 1,
  },
});

export function getFirstName(name: string) {
  return name.slice(0, name.indexOf(" "));
}
