import { Doc, Id } from "@/convex/_generated/dataModel";
import dayjs from "dayjs";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import EventGroup from "./eventGroup";

type props = {
  events?: Doc<"events">[];
  inClub: boolean;
  selection?: boolean;
  onPress?: (event: Doc<"events">) => void;
  inCreation?: boolean;
  onLongPress?: (event: Doc<"events">) => void;
  calendarToggle?: (event: Doc<"events">) => void;
  inCalendar?: boolean;
  canDelete?: boolean;
  onDelete?: (event: Doc<"events">) => void;
  childrenIds?: Id<"users">[];
  nameWidth?: number;
  uEvents?: Id<"events">[];
  onCancel?: (event: Doc<"events">) => void;

  onEdit?: (event: Doc<"events">) => void;
};

export default function EventListView({
  events,
  inClub,
  onPress,
  onLongPress,
  inCalendar,
  inCreation,
  canDelete,
  onDelete,
  nameWidth,
  childrenIds,
  calendarToggle,
  uEvents,
  onCancel,
  onEdit,
}: props) {
  const currentDate = dayjs();

  const groups = useMemo(() => {
    const grouped: Record<string, Doc<"events">[]> = {};

    if (events) {
      for (const event of events) {
        const dateKey = dayjs(event.dateNumber).format("YYYY-MM-DD");
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(event);
      }
    }

    return Object.entries(grouped)
      .sort(([a], [b]) => (dayjs(a).isAfter(dayjs(b)) ? 1 : -1))
      .map(([date, events]) => ({ date, events }))
      .filter(
        (group) =>
          dayjs(group.date)
            .startOf("day")
            .isSame(dayjs(currentDate).startOf("day")) ||
          dayjs(group.date)
            .startOf("day")
            .isAfter(dayjs(currentDate).startOf("day")),
      );
  }, [events, currentDate]);

  return (
    <View style={styles.container}>
      <Animated.FlatList
        style={styles.list}
        contentContainerStyle={styles.contentContainer}
        data={groups}
        keyExtractor={(item) => item.date}
        itemLayoutAnimation={LinearTransition}
        scrollEnabled={true}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <EventGroup
            events={item.events}
            inClub={inClub}
            onPress={onPress}
            onLongPress={onLongPress}
            calendarToggle={calendarToggle}
            inCalendar={inCalendar}
            canDelete={canDelete}
            onDelete={onDelete}
            childrenIds={childrenIds}
            nameWidth={nameWidth ? nameWidth : undefined}
            uEvents={uEvents}
            onCancel={onCancel}
            onEdit={onEdit}
          />
        )}
      />
    </View>
  );
}
export function EventListMap({
  events,
  inClub,
  onPress,
  inCreation,
  nameWidth,
}: props) {
  const currentDate = dayjs();

  const groups = useMemo(() => {
    const grouped: Record<string, Doc<"events">[]> = {};

    if (events) {
      for (const event of events) {
        const dateKey = dayjs(event.dateNumber).format("YYYY-MM-DD");
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(event);
      }
    }

    return Object.entries(grouped)
      .sort(([a], [b]) => (dayjs(a).isAfter(dayjs(b)) ? 1 : -1))
      .map(([date, events]) => ({ date, events }))
      .filter(
        (group) =>
          dayjs(group.date)
            .startOf("day")
            .isSame(dayjs(currentDate).startOf("day")) ||
          dayjs(group.date)
            .startOf("day")
            .isAfter(dayjs(currentDate).startOf("day")),
      );
  }, [events, currentDate]);

  return (
    <View style={styles.container}>
      {groups.map((group) => (
        <EventGroup
          key={group.date}
          events={group.events}
          inClub={inClub}
          onPress={onPress}
          nameWidth={nameWidth ? nameWidth : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexShrink: 1,
  },
  list: {
    width: "100%",
  },
  contentContainer: {
    paddingBottom: 24,
    flexGrow: 1,
  },
});
