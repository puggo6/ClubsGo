import { Doc } from "@/convex/_generated/dataModel";
import dayjs from "dayjs";
import React from "react";
import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import EventGroup from "./eventGroup";

type props = {
  events?: Doc<"events">[];
  inClub: boolean;
  selection?: boolean;
  onPress?: (event: Doc<"events">) => void;
  inCreation?: boolean;
  onLongPress?: (event: Doc<"events">) => void;
  inCalendar?: boolean;
};

export default function EventListView({
  events,
  inClub,
  onPress,
  onLongPress,
  inCalendar,
  inCreation,
}: props) {
  const currentDate = dayjs();
  const grouped: Record<string, Doc<"events">[]> = {};
  if (events) {
    for (const event of events) {
      const dateKey = dayjs(event.dateNumber).format("YYYY-MM-DD");
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    }
  }

  // Sort groups chronologically
  const groups = Object.entries(grouped)
    .sort(([a], [b]) => (dayjs(a).isAfter(dayjs(b)) ? 1 : -1))
    .map(([date, events]) => ({ date, events }))
    .filter(
      (events) =>
        dayjs(events.date)
          .startOf("day")
          .isSame(dayjs(currentDate).startOf("day")) ||
        dayjs(events.date)
          .startOf("day")
          .isAfter(dayjs(currentDate).startOf("day"))
    );

  return (
    <View style={{ height: inCreation ? 300 : "100%" }}>
      <Animated.FlatList
        data={groups}
        keyExtractor={(item) => item.date}
        itemLayoutAnimation={LinearTransition}
        renderItem={({ item }) => (
          <EventGroup
            events={item.events}
            inClub={inClub}
            onPress={onPress}
            onLongPress={onLongPress}
            inCalendar={inCalendar}
          />
        )}
      />
    </View>
  );
}
export function EventListMap({ events, inClub, onPress, inCreation }: props) {
  const currentDate = dayjs();
  const grouped: Record<string, Doc<"events">[]> = {};
  if (events) {
    for (const event of events) {
      const dateKey = dayjs(event.dateNumber).format("YYYY-MM-DD");
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    }
  }

  // Sort groups chronologically
  const groups = Object.entries(grouped)
    .sort(([a], [b]) => (dayjs(a).isAfter(dayjs(b)) ? 1 : -1))
    .map(([date, events]) => ({ date, events }))
    .filter(
      (events) =>
        dayjs(events.date)
          .startOf("day")
          .isSame(dayjs(currentDate).startOf("day")) ||
        dayjs(events.date)
          .startOf("day")
          .isAfter(dayjs(currentDate).startOf("day"))
    );
  const Mapping = () =>
    groups.map((g) => {
      return (
        <EventGroup
          events={g.events}
          inClub={inClub}
          onPress={onPress}
          key={Math.random()}
        />
      );
    });
  return (
    <View style={{ height: inCreation ? 300 : "100%" }}>
      <Mapping />
    </View>
  );
}
