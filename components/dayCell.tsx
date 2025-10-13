import { styles } from "@/styles/calendar.styles";
import { Text } from "@react-navigation/elements";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

type props = {
  day: number;
  isSelected: boolean;
  isPressed: boolean;
  eventNum: number;
  isCurrentMonth: boolean;
  onPress: () => void;
};

export default function dayCell({
  day,
  isSelected,
  isPressed,
  eventNum,
  isCurrentMonth,
  onPress,
}: props) {
  const [selected, setSelected] = useState(false);
  const [touchSelected, setTouchSelected] = useState(false);
  const toggleSelected = () => {
    setSelected(!selected);
  };
  return (
    <View style={styles.dayCell}>
      <Pressable onPress={onPress}>
        <View
          style={
            isSelected && !isPressed
              ? styles.selectionCircle
              : isPressed
                ? styles.filledCircle
                : styles.unSelected
          }
        >
          <Text style={isCurrentMonth ? styles.dayText : styles.greyDayText}>
            {day}
          </Text>
          {eventNum > 0 && (
            <View style={styles.eventDotContainer}>
              {Array.from({ length: Math.min(eventNum, 6) }).map((_, i) => (
                <View key={i} style={styles.eventDot} />
              ))}
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}
