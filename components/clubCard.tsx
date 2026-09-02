import { COLORS } from "@/constants/theme";
import { Doc } from "@/convex/_generated/dataModel";
import { useClubData } from "@/hooks/useClubData";

import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
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
const isWeb = Platform.OS === "web";

type props = {
  club: Doc<"clubs">;
  joinCard?: boolean;
  onPress: () => void;
  onLeave?: () => void;
  canManage?: boolean;
  inBrowse?: boolean;
  child?: boolean;

  childrenNames?: String[];
};

export default function ClubCard({
  joinCard = true,
  club,
  onPress,
  canManage = true,
  inBrowse,
  child,
  childrenNames = [],
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
  const date =
    sortedEvents[0] &&
    sortedEvents[0].eventType === "Meeting" &&
    dayjs(sortedEvents[0].dateNumber).isAfter(dayjs())
      ? dayjs(sortedEvents[0].dateNumber).format("dddd, M/D")
      : undefined;

  const tag1 = club.tags[0];
  let tag2 = club.tags[1];
  let tag3 = club.tags[2];

  const t2v = tag2 !== undefined;
  const t3v = tag3 !== undefined;

  if (tag2 === undefined) tag2 = "";
  if (tag3 === undefined) tag3 = "";

  const [hovered, setHovered] = useState(false);
  const [height, setHeight] = useState(0);

  const animatedStyle = useAnimatedStyle(() => {
    const animatedHeight = withTiming(0);
    return { height: animatedHeight };
  });

  const onLayout = (event: LayoutChangeEvent) => {
    const layoutHeight = event.nativeEvent.layout.height;
    if (layoutHeight !== 0 && layoutHeight !== height) {
      setHeight(layoutHeight);
    }
  };

  if (isWeb) {
    return (
      <TouchableOpacity
        onPress={canManage ? onPress : () => {}}
        activeOpacity={0.8}
        // @ts-ignore - web only
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={!child && { marginHorizontal: 200 }}
      >
        <View
          style={[styles.webContainer, hovered && styles.webContainerHovered]}
        >
          {club.clubColor ? (
            <View
              style={[styles.webAccentBar, { backgroundColor: club.clubColor }]}
            />
          ) : (
            <LinearGradient
              colors={["#12c2e9", "#c471ed", "#f64f59"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.webAccentBar}
            />
          )}

          <View style={styles.webContent}>
            {/* top row: name + restricted badge */}
            <View style={styles.webTitleRow}>
              <Text numberOfLines={1} style={styles.webClubName}>
                {name}
              </Text>
              {club.restricted && joinCard && (
                <View style={styles.webRestrictedBadge}>
                  <Ionicons
                    name="lock-closed"
                    size={11}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.webRestrictedText}>Restricted</Text>
                </View>
              )}
              {!club.clubPublic && canManage && !inBrowse && (
                <View style={styles.webPrivateNotice}>
                  <MaterialIcons
                    name={"public-off"}
                    style={{
                      color: COLORS.textMuted,
                    }}
                    size={22}
                  />
                  <Text style={styles.webPrivateNoticeText}>
                    This club is currently private. Make it public in Club
                    Settings to allow students and advisors to join.
                  </Text>
                </View>
              )}
            </View>

            {/* middle row: meta info */}
            <View style={styles.webMetaRow}>
              <View style={styles.webMetaItem}>
                <Ionicons
                  name="people-outline"
                  size={13}
                  color={COLORS.textMuted}
                />
                <Text style={styles.webMetaText}>
                  <Text style={{ color: COLORS.accentA }}>{members}</Text>
                  {" Member"}
                  {members !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.webMetaDivider} />
              <View style={styles.webMetaItem}>
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color={COLORS.textMuted}
                />
                {!inBrowse ? (
                  date ? (
                    <Text style={styles.webMetaText}>
                      Next:{" "}
                      <Text style={{ color: COLORS.primary }}>{date}</Text>
                    </Text>
                  ) : (
                    <Text style={styles.webMetaText}>
                      No upcomming meetings!
                    </Text>
                  )
                ) : (
                  <Text style={[styles.webMetaText, { color: COLORS.primary }]}>
                    {"Meets " +
                      (club?.meetingFreq === 0
                        ? "Weekly"
                        : club?.meetingFreq === 1
                          ? "Biweekly"
                          : club?.meetingFreq === 2
                            ? "Monthly"
                            : club?.meetingFreq === 3
                              ? "As Needed"
                              : "Daily")}
                  </Text>
                )}
              </View>
            </View>

            {/* tags row */}
            <View style={styles.webTagsRow}>
              <Tag visable={true} category={tag1} />
              {t2v && <Tag visable={t2v} category={tag2} />}
              {t3v && <Tag visable={t3v} category={tag3} />}
            </View>
            {childrenNames?.length > 0 && (
              <View style={styles.webChildrenRow}>
                <Ionicons
                  name="person-outline"
                  size={13}
                  color={COLORS.textMuted}
                />
                <Text style={styles.webMetaText}>
                  <Text style={{ color: COLORS.primary }}>
                    {childrenNames?.join(", ")}{" "}
                  </Text>
                  {childrenNames?.length > 1 ? "are" : "is"} in this club
                </Text>
              </View>
            )}
          </View>

          {/* right chevron */}
          <Entypo
            name="chevron-right"
            size={22}
            color={hovered ? COLORS.textPrimary : COLORS.textMuted}
          />
        </View>
      </TouchableOpacity>
    );
  }

  // mobile layout
  return (
    <TouchableOpacity
      onPress={canManage ? onPress : () => {}}
      activeOpacity={0.6}
    >
      <View style={styles.container}>
        <View style={styles.textContainer}>
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
              {!club.clubPublic && canManage && (
                <View style={styles.privateNotice}>
                  <Text style={styles.privateNoticeText}>
                    This club is currently private - no students or advisors can
                    join.
                  </Text>
                </View>
              )}
              <Text style={styles.clubInfo}>
                <Text style={{ color: COLORS.accentA }}>{members}</Text> Member
                {members > 1 ? "s" : ""}
              </Text>
              {!inBrowse ? (
                date ? (
                  <Text style={[styles.clubInfo, { marginBottom: 8 }]}>
                    {inBrowse && "Next Meeting: "}
                    <Text style={{ color: COLORS.primary }}>{date}</Text>
                  </Text>
                ) : (
                  <Text style={[styles.clubInfo, { marginBottom: 8 }]}>
                    No upcomming meetings!
                  </Text>
                )
              ) : (
                <Text style={[styles.clubInfo, { marginBottom: 8 }]}>
                  <Text style={{ color: COLORS.primary }}>
                    {"Meets " +
                      (club?.meetingFreq === 0
                        ? "Weekly"
                        : club?.meetingFreq === 1
                          ? "Biweekly"
                          : club?.meetingFreq === 2
                            ? "Monthly"
                            : club?.meetingFreq === 3
                              ? "As Needed"
                              : "Daily")}
                  </Text>
                </Text>
              )}
              {childrenNames.length > 0 && (
                <Text style={[styles.clubInfo, { marginTop: 4 }]}>
                  <Text style={{ color: COLORS.primary }}>
                    {childrenNames.join(", ")}{" "}
                  </Text>
                  {childrenNames.length > 1 ? "are" : "is"} in this club
                </Text>
              )}
            </View>
            {joinCard && (
              <View style={[styles.tagsContainer, { alignSelf: "flex-end" }]}>
                <Tag visable={true} category={tag1} />
                {t2v && <Tag visable={t2v} category={tag2} />}
                {t3v && <Tag visable={t3v} category={tag3} />}
              </View>
            )}
          </View>
          <Entypo name="chevron-right" size={32} color="white" />
        </View>
        {club.restricted === true && joinCard === true && (
          <View style={styles.restrictedContainer}>
            <Ionicons name="lock-closed" color={"#CCCCCC"} size={18} />
          </View>
        )}
        {!club.clubPublic && canManage && (
          <View style={styles.restrictedContainer}>
            <MaterialIcons
              name={"public-off"}

              color={COLORS.textMuted}

              size={16}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
    // @ts-ignore
    transition: "all 0.15s ease",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  webChildrenRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  webContainerHovered: {
    borderColor: `${COLORS.textPrimary}55`,
    backgroundColor: COLORS.surfaceAlternate,
    shadowOpacity: 0.35,
  },
  webAccentBar: {
    width: 8,
    alignSelf: "stretch",
  },
  webContent: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 16,
    gap: 6,
  },
  webTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  webClubName: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    fontSize: 26,
  },
  webRestrictedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${COLORS.surfaceLight}`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  webRestrictedText: {
    color: COLORS.textSecondary,
    fontFamily: "PoppinsMedium",
    fontSize: 11,
  },
  webMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  webMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  webMetaText: {
    color: COLORS.textMuted,
    fontFamily: "OpenSansRegular",
    fontSize: 14,
  },
  webMetaDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.surfaceAlternate,
  },
  webTagsRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 2,
  },

  // mobile styles
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    paddingHorizontal: 13,
    minWidth: 360,
    marginBottom: 15,
    minHeight: 85,
    width: screenWidth * 0.9,
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  clubName: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    fontSize: 24,
    marginBottom: 0,
    paddingRight: 6,
    width: 200,
  },
  clubInfo: {
    color: COLORS.textSecondary,
    fontFamily: "OpenSansRegular",
    fontSize: 12,
  },
  bottomMargin: { height: 0 },
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
  privateNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginTop: 1,
  },

  privateNoticeText: {
    color: COLORS.textMuted,
    fontFamily: "OpenSansRegular",
    fontSize: 11,
    flexShrink: 1,
  },

  webPrivateNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: -1,
  },

  webPrivateNoticeText: {
    color: COLORS.textMuted,
    fontFamily: "OpenSansRegular",
    fontSize: 13,
  },
});
