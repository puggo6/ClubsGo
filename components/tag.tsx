import { COLORS } from "@/constants/theme";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type props = {
  category: string;
  visable: boolean;
  onPress?: () => void;
};

export default function Tag({ category, visable, onPress }: props) {
  return (
    <Pressable onPress={onPress} disabled={!visable}>
      <View
        style={[
          styles.tagBack,
          visable ? { backgroundColor: "#2F2F3B" } : styles.invisibleTag,
        ]}
      >
        {visable && (
          <Text
            style={[styles.tagText, { color: getTagColor(category) }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {formatCamelCase(category)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export function LargeTag({ category, visable, onPress }: props) {
  return (
    <Pressable onPress={onPress} disabled={!visable}>
      <View
        style={[
          styles.tagBack,
          visable ? { backgroundColor: undefined } : styles.invisibleTag,
        ]}
      >
        {visable && (
          <Text
            style={[styles.largeTagText, { color: getTagColor(category) }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {formatCamelCase(category)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

type tagsProps = {
  tags: string[];
};
export function TagsText({ tags }: tagsProps) {
  const textFontSize = tags.length === 3 ? 20 : tags.length === 2 ? 24 : 28;
  return (
    <>
      <View>
        <Text style={styles.largeTagText}>
          {tags[0] && (
            <Text
              style={{ color: getTagColor(tags[0]), fontSize: textFontSize }}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {formatCamelCase(tags[0])}
            </Text>
          )}
          {tags[1] && (
            <>
              <Text> • </Text>
              <Text
                style={{ color: getTagColor(tags[1]), fontSize: textFontSize }}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {formatCamelCase(tags[1])}
              </Text>
            </>
          )}
          {tags[2] && (
            <>
              <Text> • </Text>
              <Text
                style={{ color: getTagColor(tags[2]), fontSize: textFontSize }}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {formatCamelCase(tags[2])}
              </Text>
            </>
          )}
        </Text>
      </View>
    </>
  );
}
export const availableTags = [
  "Academic",
  "Sports",
  "STEM",
  "Arts",
  "HonorSociety",
  "Recreation",
  "Music",
  "Service",
  "Other",
];
export const tagColors: { [key: string]: string } = {
  Academic: "#4A90E2",
  Sports: "#F5A623",
  STEM: "#00B8D9",
  Arts: "#D6457A",
  HonorSociety: "#FFD700",
  Recreation: "#FF7043",
  Music: "#9C27B0",
  Service: "#95e33d",
  Other: "#D5D8DC",
};

export function getTagColor(tag: string): string {
  return tagColors[tag] || "#E0E0E0";
}
export function formatCamelCase(input: string): string {
  const spaced = input.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
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
    marginVertical: 3,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "InterMedium",
  },
  largeTagText: {
    fontSize: 18,
    fontFamily: "InterSemiBold",
    color: COLORS.textSecondary,
  },
  invisibleTag: {
    backgroundColor: "transparent",
  },
});
