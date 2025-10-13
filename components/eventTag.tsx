import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatCamelCase } from "./tag";

type props = {
  onPress?: () => void;
  category: string;
  visable: boolean;
};

export default function eventTag({ onPress, category, visable }: props) {
  return (
    <Pressable onPress={onPress} disabled={!visable}>
      <View
        style={[
          styles.tagBack,
          visable ? { backgroundColor: "#2F2F3B" } : styles.invisibleTag,
        ]}
      >
        {visable && (
          <Text style={[styles.tagText, { color: getEventTagColor(category) }]}>
            {formatCamelCase(category)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export const availableEventTags = [
  "Meeting",
  "Tryout",
  "Practice",
  "Competition",
  "Tournament",
  "Game",
  "Performance",
  "Volunteering",
  "Fundraiser",
  "FieldTrip",
  "Social",
  "Deadline",
  "Election",
  "Ceremony",
  "Other",
];

export const eventTagagColors: { [key: string]: string } = {
  Meeting: "#4B7BEC",
  Tryout: "#FF9800",
  Practice: "#10B981",
  Competition: "#8B5CF6",
  Tournament: "#FFD93D",
  Game: "#EF4444",
  Performance: "#EC4899",
  Volunteering: "#16A34A",
  Fundraiser: "#22C55E",
  FieldTrip: "#F39C12",
  Social: "#EAB308",
  Deadline: "#DC2626",
  Election: "#2563EB",
  Ceremony: "#BE185D",
  Other: "#6B7280",
};

export function getEventTagColor(tag: string): string {
  return eventTagagColors[tag] || "#E0E0E0";
}

const styles = StyleSheet.create({
  tagBack: {
    backgroundColor: "#2F2F3B",

    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: "flex-start",
    borderRadius: 6,
    marginRight: 0,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "InterMedium",
  },
  invisibleTag: {
    backgroundColor: "transparent",
  },
});
