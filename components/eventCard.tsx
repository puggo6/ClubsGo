import { COLORS } from "@/constants/theme";
import { Doc } from "@/convex/_generated/dataModel";
import { useClubData } from "@/hooks/useClubData";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
}: props) {
  if (!event) return <Text>Event not found!</Text>;
  const club = useClubData(event.clubId);

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
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
                { color: getEventTagColor(event.eventType) },
              ]}
            >
              {formatCamelCase(event.eventType)}
              {!inClub && " - "}
              {!inClub && (
                <Text style={{ color: COLORS.textSecondary }}>
                  {club?.name + " "}
                </Text>
              )}
            </Text>
            {global && (
              <Ionicons
                name="earth-outline"
                size={24}
                color={COLORS.textSecondary}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.eventName}>
            {event.title}
          </Text>
          <View style={{ flexDirection: "row" }}>
            {event.startTime && (
              <Text style={styles.eventInfo}>{event.startTime}</Text>
            )}
            {event.endTime && (
              <Text style={styles.eventInfo}>{"-" + event.endTime}</Text>
            )}
            {inAnnouncement && (
              <Text
                style={[
                  styles.eventInfo,
                  { fontFamily: "InterSemiBold", color: COLORS.textSecondary },
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
              <Text style={styles.eventInfo}>{event.location}</Text>
            )}
            {event.description && (
              <Text style={[styles.eventInfo, { flexShrink: 1 }]}>
                {event.description}
              </Text>
            )}
          </View>
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
                {" • " + dayjs(date).format("MMM DD")}
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
    maxWidth: 260,
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
});
