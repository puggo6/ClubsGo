import isWeb from "@/constants/isWeb";
import { COLORS } from "@/constants/theme";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useClubContext, useClubData } from "@/hooks/useClubData";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import {
    Pressable,
    Animated as RNAnimated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { getEventTagColor } from "./eventTag";
import { formatCamelCase } from "./tag";

type props = {
  event?: Doc<"events">;
  inClub: boolean;
  onEvent: boolean;
  inAnnouncement?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  global?: boolean;
  onDelete?: () => void;
  canDelete?: boolean;
  onCancel?: () => void;
  cancelled?: boolean;
  onEdit?: () => void;
  childrenIds?: Id<"users">[];
  webCal?: boolean;
  nameWidth?: number;
  inCalendar?: boolean;
  calendarToggle?: () => void;
  removal?: boolean;
};

type dProps = {
  event?: Doc<"events">;
  childrenIds?: Id<"users">[];
  onPress?: () => void;
};

type bProps = {
  category: string;
  name: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  date: string;
  inClub: boolean;

  inAnnouncement?: boolean;
  onPress?: () => void;
};

export default function EventCard({
  event,
  inClub,
  onEvent,
  onLongPress,
  inAnnouncement,
  global,
  onPress,
  onDelete,
  canDelete,
  onCancel,
  cancelled,
  onEdit,
  childrenIds,
  webCal,
  nameWidth,
  inCalendar,
  calendarToggle,
  removal,
}: props) {
  const club = useClubContext(event?.clubId);

  const [showOptions, setShowOptions] = useState(false);
  const optionsAnimation = useRef(
    new RNAnimated.Value(showOptions ? 1 : 0),
  ).current;
  const rotation = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(optionsAnimation, {
      toValue: showOptions ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();

    RNAnimated.timing(rotation, {
      toValue: showOptions ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [optionsAnimation, rotation, showOptions]);

  const handleToggleOptions = () => {
    setShowOptions((prev) => !prev);
  };

  const handleDelete = () => {
    setShowOptions(false);
    onDelete?.();
  };

  const animatedOptionsStyle = {
    width: optionsAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [32, 96],
    }),
    height: optionsAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [32, 80],
    }),
    borderRadius: optionsAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 16],
    }),
  };

  const dotsStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "90deg"],
        }),
      },
    ],
  };

  const children = club?.members
    .filter((m) => childrenIds?.includes(m.userId))
    .map((m) => m.user?.fullName)
    .map((n) => n?.substring(0, n.indexOf(" ")));

  if (!event) return <Text>Event not found!</Text>;
  const description = event.description;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={webCal ? { width: "100%" } : undefined}
    >
      <View style={[styles.container, webCal && { width: "100%" }]}>
        <View
          style={[
            styles.colorBar,
            {
              backgroundColor: cancelled
                ? COLORS.cancelled
                : getEventTagColor(event.eventType),
            },
          ]}
        />
        <View style={webCal ? { flex: 1, minWidth: 0 } : undefined}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={[
                styles.eventType,
                {
                  color: getEventTagColor(event.eventType),
                },
                webCal && { fontSize: 13 },
              ]}
            >
              {formatCamelCase(event.eventType)}
              {!inClub && " - "}
              {!inClub && (
                <Text style={{ color: COLORS.textSecondary }}>
                  {club?.name}
                </Text>
              )}
              {cancelled && " - "}
              {cancelled && (
                <Text
                  style={{ color: COLORS.cancelled, fontFamily: "InterBold" }}
                >
                  CANCELLED
                </Text>
              )}
            </Text>
            {global && inClub && (
              <Ionicons
                name="earth-outline"
                size={18}
                color={COLORS.textSecondary}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", width: "100%" }}
          >
            <Text
              numberOfLines={webCal ? undefined : isWeb() ? 3 : 1}
              adjustsFontSizeToFit={isWeb() ? false : true}
              style={[
                styles.eventName,
                webCal && { fontSize: 18 },
                nameWidth ? { width: nameWidth } : {},
              ]}
            >
              {event.title}
            </Text>
            {isWeb() && calendarToggle && (
              <>
                {removal ? (
                  <TouchableOpacity
                    onPress={calendarToggle}
                    style={webStyles.removeButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={calendarToggle}
                    style={[
                      webStyles.calButton,
                      inCalendar && webStyles.calButtonActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={inCalendar ? "calendar" : "calendar-outline"}
                      size={14}
                      color={inCalendar ? COLORS.primary : COLORS.textMuted}
                    />

                    <Text
                      style={[
                        webStyles.calButtonText,
                        inCalendar && webStyles.calButtonTextActive,
                      ]}
                    >
                      {inCalendar ? "Added" : "Add"}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
          {children && (
            <FlatList
              data={children}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item ?? Math.random.toString()}
              renderItem={({ item }) => {
                return (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 8,
                        aspectRatio: 1,
                        borderRadius: 8,
                        backgroundColor: COLORS.primary,
                      }}
                    />
                    <Text style={styles.childrenText}>{item}</Text>
                  </View>
                );
              }}
            />
          )}
          <View style={{ flexDirection: "row" }}>
            {event.startTime && (
              <Text style={[styles.eventInfo, webCal && { fontSize: 12 }]}>
                {event.startTime}
              </Text>
            )}
            {event.endTime && (
              <Text style={[styles.eventInfo, webCal && { fontSize: 12 }]}>
                {"-" + event.endTime}
              </Text>
            )}
            {inAnnouncement && (
              <Text
                style={[
                  styles.eventInfo,
                  { fontFamily: "InterSemiBold", color: COLORS.textSecondary },
                  webCal && { fontSize: 12 },
                ]}
              >
                {" • " + dayjs(event.dateNumber).format("MMM DD")}
              </Text>
            )}
          </View>
          <View
            style={{
              alignItems: "flex-start",
              marginRight: 20,
            }}
          >
            {event.location && (
              <Text style={[styles.eventInfo, webCal && { fontSize: 12 }]}>
                {event.location}
              </Text>
            )}
            {
              <Text
                style={[
                  styles.eventInfo,
                  { flexShrink: 1 },
                  webCal && { fontSize: 12 },
                ]}
              >
                {description ?? ""}
              </Text>
            }
          </View>
        </View>
        <View
          style={{
            flex: canDelete ? 0 : undefined,
            alignItems: "flex-end",
            marginRight: canDelete ? 15 : 0,
            marginLeft: canDelete ? 30 : 0,
            justifyContent: "center",
            width: canDelete ? 40 : 0,
          }}
        >
          {canDelete && (
            <View style={styles.dotsContainer}>
              <RNAnimated.View
                style={[styles.optionsMenu, animatedOptionsStyle]}
              >
                <RNAnimated.View
                  style={[
                    dotsStyle,
                    {
                      position: "absolute",
                      right: 0,
                      top: 0,
                      zIndex: 10,
                      elevation: 10,
                    },
                  ]}
                >
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
                </RNAnimated.View>

                {showOptions && (
                  <View style={styles.optionsContent}>
                    <TouchableOpacity
                      style={styles.optionButton}
                      onPress={onEdit}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={"create-outline"}
                        size={14}
                        color={COLORS.textPrimary}
                      />
                      <Text style={styles.optionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.optionButton}
                      onPress={onCancel}
                      activeOpacity={0.8}
                    >
                      <FontAwesome
                        name="calendar-times-o"
                        size={12}
                        color={"#F59E0B"}
                      />
                      <Text style={[styles.optionText, styles.cancelText]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.optionButton}
                      onPress={handleDelete}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color="#ff7b7b"
                      />
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
      </View>
    </Pressable>
  );
}

export function DashboardEventCard({
  event,

  onPress,
}: dProps) {
  if (!event) return <Text>Event not found!</Text>;
  const club = useClubData(event.clubId);

  return (
    <Pressable onPress={onPress}>
      <View style={styles.container}>
        <View
          style={[
            styles.colorBar,
            { backgroundColor: getEventTagColor(event.eventType) },
          ]}
        />
        <View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={[
                styles.eventType,
                {
                  color: getEventTagColor(event.eventType),
                  fontSize: 20,
                  paddingRight: 8,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatCamelCase(event.eventType)}
              {" - "}
              {
                <Text style={{ color: COLORS.textPrimary }}>
                  {club?.name + " "}
                </Text>
              }
            </Text>
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              {
                fontSize: 14,
                color: COLORS.textSecondary,
                fontFamily: "InterSemiBold",
              },
            ]}
          >
            {event.title}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function ManualEventCard({
  category,
  name,
  startTime,
  endTime,
  inClub,
  date,
  inAnnouncement,
  onPress,
  location,
}: bProps) {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.container}>
        <View
          style={[
            styles.colorBar,
            { backgroundColor: getEventTagColor(category) },
          ]}
        />
        <View>
          <Text
            style={[styles.eventType, { color: getEventTagColor(category) }]}
          >
            {formatCamelCase(category)}
            {!inClub && " - "}
          </Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.eventName}>
            {name}
          </Text>
          <View style={{ flexDirection: "row" }}>
            {startTime && <Text style={styles.eventInfo}>{startTime}</Text>}
            {endTime && <Text style={styles.eventInfo}>{"-" + endTime}</Text>}
            {inAnnouncement && (
              <Text style={styles.eventInfo}>
                {(startTime ? " • " : "") + dayjs(date).format("MMM DD")}
              </Text>
            )}
          </View>
          <View style={{ alignItems: "flex-start" }}>
            {location && <Text style={styles.eventInfo}>{location}</Text>}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginVertical: 5,
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  colorBar: {
    width: 5,
    height: "100%",
    borderRadius: 3,
    marginRight: 12,
    paddingHorizontal: 0,
    paddingVertical: 3,
  },
  eventType: {
    fontSize: 16,
    fontFamily: "InterSemiBold",
    color: "#fff",
    textAlign: "left",
  },
  eventName: {
    fontSize: 20,
    fontFamily: "PoppinsBold",
    color: COLORS.textPrimary,
    textAlign: "left",
  },
  eventInfo: {
    fontSize: 14,
    fontFamily: "InterRegular",
    textAlign: "left",
    color: COLORS.textMuted,
  },
  dateBar: {
    width: 85,
    paddingHorizontal: 0,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingVertical: 6,
  },
  dateText: {
    fontFamily: "PoppinsMedium",
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  dateSubText: {
    fontFamily: "PoppinsMedium",
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  triggerRow: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    minHeight: 32,
    paddingTop: 2,
    zIndex: 100,
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

    justifyContent: "center",
    zIndex: 1,
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
  cancelText: {
    color: "#F59E0B",
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
  dotsContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    marginRight: 10,
    minHeight: 28,
    width: "100%",
  },
  childrenText: {
    fontSize: 16,
    fontFamily: "PoppinsRegular",
    color: COLORS.primary,
    marginRight: 8,
    marginLeft: 4,
  },
});
const webStyles = StyleSheet.create({
  calButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlternate,
    backgroundColor: "transparent",
    marginLeft: 8,
  },
  calButtonActive: {
    borderColor: `${COLORS.primary}55`,
    backgroundColor: `${COLORS.primary}11`,
  },
  calButtonText: {
    color: COLORS.textMuted,
    fontFamily: "PoppinsMedium",
    fontSize: 13,
  },
  calButtonTextActive: {
    color: COLORS.primary,
  },
  removeButton: {
    position: "absolute",
    top: -20,
    right: -20,

    width: 26,
    height: 26,
    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: COLORS.surfaceAlternate,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
});
