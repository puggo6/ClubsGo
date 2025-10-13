import { COLORS } from "@/constants/theme";
import { Doc } from "@/convex/_generated/dataModel";
import { useClubData } from "@/hooks/useClubData";
import { Entypo, Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAnimatedStyle, withTiming } from "react-native-reanimated";
import Tag from "./tag";
const screenWidth = Dimensions.get("window").width;
type props = {
  club: Doc<"clubs">;
  joinCard?: boolean;
  onPress: () => void;
  onLeave?: () => void;
  canManage?: boolean; //If the user is in the club, will be false if the user is a pending member and not yet approved
};

export default function ClubCard({
  joinCard = true,
  club,
  onPress,
  canManage = true,
}: props) {
  const events = (useClubData(club._id)?.eventList ?? []).filter(
    (e): e is Doc<"events"> => !!e && !!e.startTime
  );

  const sortedEvents = [...events].sort((a, b) => {
    if (!a.startTime || !b.startTime) return 0;
    const timeA = dayjs(a.startTime, "HH:mm");
    const timeB = dayjs(b.startTime, "HH:mm");
    return timeA.isAfter(timeB) ? 1 : -1;
  });

  const name = club.name;
  const members = club.numMembers;
  const date = sortedEvents[0]
    ? dayjs(sortedEvents[0].dateNumber).format("dddd") +
      ", " +
      dayjs(sortedEvents[0].dateNumber).format("M/D")
    : "Unset";
  const description = club.description;
  const tag1 = club.tags[0];
  let tag2 = club.tags[1];
  let tag3 = club.tags[2];

  const t2v = tag2 !== undefined;
  const t3v = tag3 !== undefined;
  const buttonText = joinCard
    ? club.restricted
      ? "   Info   "
      : "Join Club"
    : "Manage";

  if (tag2 === undefined) tag2 = "";
  if (tag3 === undefined) tag3 = "";

  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const [height, setHeight] = useState(0);

  const animatedStyle = useAnimatedStyle(() => {
    const animatedHeight = expanded ? withTiming(height) : withTiming(0);
    return {
      height: animatedHeight,
    };
  });

  const onLayout = (event: LayoutChangeEvent) => {
    const layoutHeight = event.nativeEvent.layout.height;

    if (layoutHeight !== 0 && layoutHeight !== height) {
      setHeight(layoutHeight);
    }
  };

  return (
    <TouchableOpacity
      onPress={canManage ? onPress : () => {}}
      activeOpacity={0.6}
    >
      <View style={styles.container}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={[styles.componentsContainer, { flex: 1 }]}>
            <View style={styles.clubText}>
              <View style={styles.titleText}>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={styles.clubName}
                >
                  {name}
                </Text>
              </View>

              <Text style={styles.clubInfo}>
                <Text style={{ color: COLORS.accentA }}>{members}</Text> Member
                {members > 1 ? "s" : ""}
              </Text>
              <Text style={[styles.clubInfo, { marginBottom: 8 }]}>
                Next Meeting:{" "}
                <Text style={{ color: COLORS.primary, position: "absolute" }}>
                  {/*club?.meetingFreq === 0
                    ? "Weekly"
                    : club?.meetingFreq === 1
                      ? "Biweekly"
                      : club?.meetingFreq === 2
                        ? "Monthly"
                        : club?.meetingFreq === 3
                          ? "As Needed"
                          : "Daily"*/}
                  {date}
                </Text>
              </Text>
            </View>

            <View style={[styles.tagsContainer, { alignSelf: "flex-end" }]}>
              <Tag visable={true} category={tag1} />
              {t2v && <Tag visable={t2v} category={tag2} />}
              {t3v && <Tag visable={t3v} category={tag3} />}
            </View>

            {/*{canManage && (
            <View style={styles.buttonContainer}>
              <SizeGradientButton
                onPress={onPress}
                title={buttonText}
                width={8}
                height={6}
                restricted={club.restricted && joinCard}
              />
            </View>
          )}*/}
          </View>

          <Entypo name="chevron-right" size={32} color="white" />
        </View>
        {club.restricted === true && joinCard === true && (
          <View style={styles.restrictedContainer}>
            <Ionicons name="lock-closed" color={"#CCCCCC"} size={18} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,

    borderRadius: 25,
    paddingHorizontal: 13,
    minWidth: 360,
    marginBottom: 15,
    minHeight: 85,
    width: screenWidth * 0.9,
    justifyContent: "flex-start",
    ...Platform.select({
      web: {
        width: "100%", // Use full width on web
        maxWidth: 900, // Optional max to avoid stretching too far
        alignSelf: "center",
      },
    }),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)", // soft white
    // Optional subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    fontFamily: "OpenSansRegular",
    fontSize: 12,
  },
  bottomMargin: {
    height: 0,
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",

    height: 85,
  },
  componentsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tagsContainer: {
    alignItems: "center",
    paddingTop: 5,
    flexDirection: "column",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
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
});
