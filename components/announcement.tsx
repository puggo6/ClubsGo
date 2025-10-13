import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Image } from "expo-image";
import React, { memo, useEffect, useState } from "react";
import { Image as RNImage, StyleSheet, Text, View } from "react-native";
import EventCard from "./eventCard";
type props = {
  description: string;
  image?: string;
  dateCreated: string;
  automated?: boolean;
  eventId?: Id<"events">;
};

function Announcement({
  description,
  image,
  dateCreated,
  automated = false,
  eventId,
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

  useEffect(() => {
    if (image) {
      RNImage.getSize(
        image,
        (width, height) => {
          setImageDimensions({ width, height });
        },
        (error) => {
          console.error("Failed to get image size", error);
        }
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

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Ionicons name="megaphone" size={18} color={COLORS.textPrimary} />
        <Text style={styles.headerText}>Announcement</Text>
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
  headerText: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    fontSize: 13,
    marginLeft: 10,
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
