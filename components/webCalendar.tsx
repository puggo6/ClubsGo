import { COLORS } from "@/constants/theme";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import EventCard from "./eventCard";
import { getEventTagColor } from "./eventTag";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type Props = {
  inClub?: boolean;
  canEdit?: boolean;
  events: (Doc<"events"> | null)[];
  onEventPress?: (event: Doc<"events">) => void;
  onEventLongPress?: (event: Doc<"events">) => void;
  onEdit?: (event: Doc<"events">) => void;
  onCancel?: (event: Doc<"events">) => void;
  onDelete?: (event: Doc<"events">) => void;
  removal?: boolean;
  children?: Id<"users">[];
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WebCalendar({
  events,
  onEventPress,
  onEventLongPress,
  inClub,
  canEdit,
  onCancel,
  onDelete,
  onEdit,
  removal,
  children,
}: Props) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    dayjs().startOf("week"),
  );

  const weekDays: Dayjs[] = Array.from({ length: 7 }, (_, i) =>
    currentWeekStart.add(i, "day"),
  );

  const goToPrevWeek = () => setCurrentWeekStart((w) => w.subtract(1, "week"));
  const goToNextWeek = () => setCurrentWeekStart((w) => w.add(1, "week"));
  const goToToday = () => setCurrentWeekStart(dayjs().startOf("week"));

  const getEventsForDay = (day: Dayjs) =>
    (events ?? [])
      .filter((e): e is Doc<"events"> => e !== null)
      .filter((e) => dayjs(e.dateNumber).isSame(day, "day"))
      .sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return a.startTime.localeCompare(b.startTime);
      });

  const monthLabel = () => {
    const startMonth = currentWeekStart.format("MMMM");
    const endMonth = currentWeekStart.add(6, "day").format("MMMM");
    const year = currentWeekStart.format("YYYY");
    if (startMonth === endMonth) return `${startMonth} ${year}`;
    return `${startMonth} – ${endMonth} ${year}`;
  };

  const isToday = (day: Dayjs) => day.isSame(dayjs(), "day");

  return (
    <View style={styles.container}>
      {/* header row */}
      <View style={styles.header}>
        <Text style={styles.monthLabel}>{monthLabel()}</Text>
        <View style={styles.headerControls}>
          <Pressable onPress={goToToday} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>Today</Text>
          </Pressable>
          <Pressable onPress={goToPrevWeek} style={styles.navButton}>
            <Ionicons
              name="chevron-back"
              size={18}
              color={COLORS.textSecondary}
            />
          </Pressable>
          <Pressable onPress={goToNextWeek} style={styles.navButton}>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={COLORS.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* day columns */}
      <View style={styles.grid}>
        {weekDays.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const today = isToday(day);

          return (
            <View key={i} style={[styles.dayColumn, today && {}]}>
              {/* day header */}
              <View style={[styles.dayHeader, today && styles.dayHeaderToday]}>
                <View style={{}}>
                  <Text
                    style={[styles.dayNumber, today && styles.dayNumberToday]}
                  >
                    {day.date()}
                  </Text>
                </View>
                <Text style={[styles.dayLabel, today && styles.dayLabelToday]}>
                  {DAY_LABELS[i]}
                </Text>
              </View>

              {/* events */}
              <ScrollView
                style={styles.eventsScroll}
                showsVerticalScrollIndicator={false}
              >
                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => {
                    const color = getEventTagColor(event.eventType);

                    return (
                      <View style={{ maxWidth: 10 }} key={event._id}>
                        {/* <Pressable
                        key={event._id}
                        onPress={() => onEventPress?.(event)}
                        onLongPress={() => onEventLongPress?.(event)}
                        style={({ pressed }) => [
                          styles.eventChip,
                          { borderLeftColor: color },
                          pressed && styles.eventChipPressed,
                        ]}
                      >
                        <Text
                          style={[styles.eventType, { color }]}
                          numberOfLines={1}
                        >
                          {event.eventType}
                        </Text>
                        <Text style={styles.eventTitle} numberOfLines={2}>
                          {event.title}
                        </Text>
                        {event.startTime && (
                          <View style={styles.eventTimeRow}>
                            <Ionicons
                              name="time-outline"
                              size={10}
                              color={COLORS.textMuted}
                            />
                            <Text style={styles.eventTime}>
                              {event.startTime}
                              {event.endTime ? ` – ${event.endTime}` : ""}
                            </Text>
                          </View>
                        )}
                        {event.location && (
                          <View style={styles.eventTimeRow}>
                            <Ionicons
                              name="location-outline"
                              size={10}
                              color={COLORS.textMuted}
                            />
                            <Text style={styles.eventTime} numberOfLines={1}>
                              {event.location}
                            </Text>
                          </View>
                        )}
                      </Pressable>*/}
                        <EventCard
                          event={event}
                          inClub={inClub ?? false}
                          onEvent={false}
                          webCal={true}
                          canDelete={canEdit ?? false}
                          onEdit={() => onEdit?.(event)}
                          onCancel={() => onCancel?.(event)}
                          onDelete={() => onDelete?.(event)}
                          cancelled={event.canceled}
                          removal={removal ?? false}
                          childrenIds={children}
                        />
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyDay} />
                )}
              </ScrollView>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlternate,
  },
  monthLabel: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    fontSize: 18,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlternate,
    marginRight: 4,
  },
  todayButtonText: {
    color: COLORS.textSecondary,
    fontFamily: "PoppinsMedium",
    fontSize: 12,
  },
  navButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlternate,
  },
  grid: {
    flex: 1,
    flexDirection: "row",
  },
  dayColumn: {
    flex: 1,
  },
  dayHeader: {
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlternate,
    backgroundColor: COLORS.surface,
    gap: 4,
  },
  dayHeaderToday: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  dayLabel: {
    color: COLORS.textMuted,
    fontFamily: "PoppinsMedium",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dayLabelToday: {
    color: COLORS.primary,
  },

  dayNumber: {
    color: COLORS.textSecondary,
    fontFamily: "PoppinsBold",
    fontSize: 18,
  },
  dayNumberToday: {
    color: COLORS.primary,
  },
  eventsScroll: {
    flex: 1,
    padding: 6,
    borderRightWidth: 0.5,
    borderRightColor: COLORS.surfaceAlternate,
    borderLeftWidth: 0.5,
    borderLeftColor: COLORS.surfaceAlternate,
  },
  eventChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 2,
  },
  eventChipPressed: {
    opacity: 0.7,
  },
  eventType: {
    fontFamily: "InterSemiBold",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  eventTitle: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsMedium",
    fontSize: 12,
    lineHeight: 16,
  },
  eventTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  eventTime: {
    color: COLORS.textMuted,
    fontFamily: "InterRegular",
    fontSize: 10,
  },
  emptyDay: {
    width: 25,
    height: 4,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceAlternate,
    alignSelf: "center",
    marginTop: 40,
  },
  emptyText: {
    color: COLORS.surfaceAlternate,
    fontSize: 16,
  },
});
