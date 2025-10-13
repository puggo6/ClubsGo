import { styles } from "@/styles/calendar.styles";
import dayjs from "dayjs";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DayCell from "./dayCell";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type props = {
  admin: boolean;
  eventList: Set<string>;
  onCellPress: (selectedDate: dayjs.Dayjs) => void;
  pressedDay?: dayjs.Dayjs;
  currentInputDate: dayjs.Dayjs;
  onMonthChange: (newDate: dayjs.Dayjs) => void;
};

export default function Calendar({
  admin,
  eventList,
  onCellPress,
  pressedDay,
  currentInputDate,
  onMonthChange,
}: props) {
  const currentDate = currentInputDate;

  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");

  const startDay = startOfMonth.startOf("week");
  const endDay = endOfMonth.endOf("week");
  const firstDayOfWeek = startOfMonth.day(); // 0 = Sunday, 1 = Monday, etc.
  const daysInMonth = currentDate.daysInMonth(); // Number of days in the month

  const days: any[] = [];
  let day = startDay;

  const calendarCells: (dayjs.Dayjs | null)[] = [];

  let current = startDay;
  while (current.isBefore(endDay) || current.isSame(endDay, "day")) {
    calendarCells.push(current);
    current = current.add(1, "day");
  }

  const handleMonthChange = (direction: "next" | "prev") => {
    const newDate =
      direction === "next"
        ? currentDate.add(1, "month")
        : currentDate.subtract(1, "month");

    onMonthChange(newDate); // tell the parent to update
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleMonthChange("prev")}>
          <Text style={styles.navText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{currentDate.format("MMMM YYYY")}</Text>
        <TouchableOpacity onPress={() => handleMonthChange("next")}>
          <Text style={styles.navText}>{">"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.dayNameRow}>
        {WEEK_DAYS.map((d) => (
          <View key={d} style={styles.dayNameContainer}>
            <Text key={d} style={styles.dayNames}>
              {d}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ justifyContent: "center" }}>
        <View style={styles.dayCellContainer}>
          {calendarCells.map((day, index) =>
            day === null ? (
              <View key={index} style={styles.dayCellPlaceholder} />
            ) : (
              <DayCell
                key={index}
                day={day.date()}
                isSelected={day.isSame(dayjs(), "day")}
                isPressed={day.isSame(pressedDay)}
                eventNum={
                  Array.from(eventList).filter(
                    (event) => event === day.format("YYYY-MM-DD")
                  ).length
                }
                isCurrentMonth={day.month() === currentDate.month()}
                onPress={() => {
                  onCellPress(day);
                }}
              />
            )
          )}
        </View>
      </View>
    </View>
  );
}
