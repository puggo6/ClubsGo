import { COLORS } from "@/constants/theme";
import { Doc } from "@/convex/_generated/dataModel";
import dayjs from "dayjs";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import EventCard from "./eventCard";

type props = {
  events: Doc<"events">[];
  inClub: boolean;
  onPress?: (event: Doc<"events">) => void;
  onLongPress?: (event: Doc<"events">) => void;
  inCalendar?: boolean;
};

export default function EventGroup({
  events,
  inClub,
  onPress,
  onLongPress,
  inCalendar,
}: props) {
  const sortedEvents = [...events].sort((a, b) => {
    if (!a.startTime || !b.startTime) return 0;
    const timeA = dayjs(a.startTime, "HH:mm");
    const timeB = dayjs(b.startTime, "HH:mm");
    return timeA.isAfter(timeB) ? 1 : -1;
  });
  const date = dayjs(events[0].dateNumber).format("MMM DD");
  const day = dayjs(events[0].dateNumber).format("dddd");
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dateBar,
          events[0]
            ? dayjs(events[0].dateNumber)
                .startOf("day")
                .isSame(dayjs().startOf("day"), "day")
              ? { backgroundColor: "#0078ff" }
              : {}
            : {},
        ]}
      >
        <Text style={styles.dateText}>
          {
            /*events[0].dateString.substring(
            events[0].dateString.indexOf(",") + 2,
            events[0].dateString.indexOf(",") + 5
          ) why did i even try to do this */
            date
          }
        </Text>
        <Text
          style={[
            styles.dateSubText,
            events[0]
              ? dayjs(events[0].dateNumber)
                  .startOf("day")
                  .isSame(dayjs().startOf("day"), "day")
                ? { color: COLORS.textPrimary }
                : {}
              : {},
          ]}
        >
          {day}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        {sortedEvents.map((event) => (
          <EventCard
            event={event}
            inClub={inClub}
            onEvent={false}
            key={event._id}
            onPress={onPress ? () => onPress(event) : undefined}
            onLongPress={onLongPress ? () => onLongPress(event) : undefined}
            global={event.global && inCalendar}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
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
    textAlign: "center",
    color: COLORS.textMuted,
  },
  dateBar: {
    width: 85,
    paddingHorizontal: 5,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    borderRadius: 13,
    marginVertical: 5,
    marginLeft: 14,
  },
  dateText: {
    fontFamily: "PoppinsMedium",
    color: COLORS.textPrimary,
    fontSize: 16,
    paddingTop: 6,
  },
  dateSubText: {
    fontFamily: "PoppinsMedium",
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
