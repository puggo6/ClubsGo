import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Image } from "expo-image";
import React, { memo, useEffect, useRef, useState } from "react";
import {
  Animated as RNAnimated,
  Image as RNImage,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import EventCard from "./eventCard";
type props = {
  description: string;
  image?: string;
  dateCreated: string;
  automated?: boolean;
  eventId?: Id<"events">;
  pinned?: boolean;
  isAdmin: boolean;
  onPin?: (pinned?: boolean) => void;
};

function Announcement({
  description,
  image,
  dateCreated,
  automated = false,
  eventId,
  pinned = false,
  isAdmin,
  onPin,
}: props) {
  const user = useUserData();
  let event = undefined;
  if (eventId) event = useQuery(api.events.getEvent, { eventId: eventId });

  if (!eventId) event = undefined;

  const name = user?.userData.fullName;
  const userPFP = user?.profilePicture;
  const creationDate = dateCreated;

  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isPinned, setIsPinned] = useState(pinned);
  const optionsAnimation = useRef(
    new RNAnimated.Value(showOptions ? 1 : 0),
  ).current;

  useEffect(() => {
    if (image) {
      RNImage.getSize(
        image,
        (width, height) => {
          setImageDimensions({ width, height });
        },
        (error) => {
          console.error("Failed to get image size", error);
        },
      );
    }
  }, [image]);

  const [imageUrl, setImageUrl] = useState("");
  const [userUrl, setUserUrl] = useState("");

  useEffect(() => {
    if (!imageUrl && image) {
      setImageUrl(image); // Fetch once
    }
  }, []);

  useEffect(() => {
    if (!userUrl && userPFP) {
      setUserUrl(userPFP); // Fetch once
    }
  }, []);

  dayjs.extend(relativeTime);

  useEffect(() => {
    RNAnimated.spring(optionsAnimation, {
      toValue: showOptions ? 1 : 0,
      useNativeDriver: false,
      friction: 10,
      tension: 90,
    }).start();
  }, [optionsAnimation, showOptions]);

  const handleToggleOptions = () => {
    setShowOptions((prev) => !prev);
  };

  const handlePinAnnouncement = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    onPin?.(newPinned); // ← pass the new value up
    setShowOptions(false);
  };

  const handleDeleteAnnouncement = () => {
    setShowOptions(false);
  };

  const animatedOptionsStyle = {
    width: optionsAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [32, 96],
    }),
    height: optionsAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [32, 92],
    }),
    borderRadius: optionsAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 16],
    }),
  };
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(showOptions ? 90 : 0, { duration: 200 });
  }, [showOptions]);

  const dotsStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Ionicons name="megaphone" size={18} color={COLORS.textPrimary} />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerText}>Announcement</Text>
          {isPinned && (
            <View style={styles.statusBadge}>
              <Ionicons name={"pin"} size={10} color={COLORS.textPrimary} />
              <Text style={styles.statusText}>{"Pinned"}</Text>
            </View>
          )}
        </View>
        {isAdmin && (
          <View style={styles.dotsContainer}>
            <RNAnimated.View style={[styles.optionsMenu, animatedOptionsStyle]}>
              <View style={styles.triggerRow}>
                <Animated.View style={dotsStyle}>
                  <TouchableOpacity
                    onPress={handleToggleOptions}
                    style={styles.dotsButton}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={18}
                      color={COLORS.textPrimary}
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {showOptions && (
                <View style={styles.optionsContent}>
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={handlePinAnnouncement}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isPinned ? "pin" : "pin-outline"}
                      size={14}
                      color={COLORS.textPrimary}
                    />
                    <Text style={styles.optionText}>
                      {isPinned ? "Unpin" : "Pin"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={handleDeleteAnnouncement}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={14} color="#ff7b7b" />
                    <Text style={[styles.optionText, styles.deleteText]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </RNAnimated.View>
          </View>
        )}
      </View>
      <View style={styles.divider} />
      <View style={styles.userInfo}>
        <View style={styles.contentContainer}>
          <Image source={{ uri: userUrl }} style={styles.userAvatar} />
          <View style={styles.nameContainer}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={styles.userName}
            >
              {name}
            </Text>

            <Text style={styles.userInfoText}>
              {dayjs(dateCreated).fromNow()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.description}>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>
      <View style={styles.eventContainer}>
        {event && (
          <EventCard
            event={event}
            inClub={true}
            onEvent={false}
            inAnnouncement={true}
          />
        )}
      </View>
      {image && imageDimensions && (
        <View style={{ width: "100%", alignItems: "center" }}>
          {/*<Image
            source={{ uri: imageUrl }}
            style={{
              width: 300,
              aspectRatio: imageDimensions?.width / imageDimensions?.height,
              borderRadius: 20,
              marginTop: 0,
              marginBottom: 15,
            }}
            contentFit="cover"
            transition={100}
            cachePolicy={"memory-disk"}
          />*/}
        </View>
      )}
    </View>
  );
}

export default memo(Announcement, (prev, next) => {
  // return true if props are equal (skip re-render)
  return (
    prev.description === next.description &&
    prev.image === next.image &&
    prev.dateCreated === next.dateCreated
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,

    marginVertical: 20,
    marginHorizontal: 30,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)", // soft white
    // Optional subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  userInfo: {
    flexDirection: "row",
  },
  header: {
    textAlign: "left",
    paddingBottom: 5,
    alignItems: "flex-start",
  },
  title: {
    fontFamily: "PoppinsBold",
    color: COLORS.textPrimary,
    fontSize: 32,
  },
  description: {
    marginVertical: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: "left",
    fontFamily: "MonserratRegular",
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  contentContainer: {
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 18,
    marginRight: 12,
  },
  userName: {
    fontSize: 14,
    fontFamily: "PoppinsMedium",
    color: COLORS.textPrimary,
    alignSelf: "center",
    width: 150,
  },
  userInfoText: {
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  nameContainer: {
    flexDirection: "column",
  },
  headerContainer: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginVertical: 10,
  },
  dotsContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    marginRight: 10,
    minHeight: 28,
  },
  headerTitleContainer: {
    flexDirection: "column",
    marginLeft: 10,
    flex: 1,
  },
  triggerRow: {
    width: "100%",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    minHeight: 32,
    paddingTop: 2,
  },
  dotsButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 2,
  },
  optionsMenu: {
    position: "absolute",
    right: 0,
    top: -2,

    flexDirection: "column",

    overflow: "hidden",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: COLORS.surfaceAlternate,
  },
  optionsContent: {
    width: "100%",
    marginTop: 2,
    justifyContent: "center",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    width: "100%",
  },
  optionText: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsMedium",
    fontSize: 12,
    marginLeft: 4,
  },
  deleteText: {
    color: "#ff7b7b",
  },
  headerText: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  statusText: {
    color: COLORS.textSecondary,
    fontFamily: "PoppinsMedium",
    fontSize: 10,
  },
  divider: {
    backgroundColor: COLORS.surfaceAlternate,
    height: 2,
    marginHorizontal: 20,
  },
  eventContainer: {
    marginLeft: 10,
    paddingBottom: 15,
  },
});
