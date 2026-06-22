import { COLORS } from "@/constants/theme";
import { Doc } from "@/convex/_generated/dataModel";
import { useClubData } from "@/hooks/useClubData";
import { styles } from "@/styles/card.styles";
import { Entypo, Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
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
