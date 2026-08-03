import { isHeadAdmin } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DashboardEventCard } from "./eventCard";
const screenWidth = Dimensions.get("window").width;
type props = {};
export default function HomeDashboard() {
  const currentDate = dayjs();
  const currentUser = useUserData();

  let masterClubs = currentUser?.userData.clubs ?? [];
  const insets = useSafeAreaInsets();
  if (
    isHeadAdmin(currentUser?.userData.role) &&
    currentUser?.userData.school?.clubList
  )
    masterClubs =
      useQuery(api.clubs.getClubList, {
        clubList: currentUser.userData.school?.clubList,
      }) ?? [];

  const clubIds = masterClubs.flatMap((club) => (club ? club.eventList : []));
  const eventIds = [...clubIds, ...(currentUser?.userData.eventList ?? [])];
  let allEvents = useQuery(api.events.getManyEvents, {
    eventIds: eventIds,
  });
  let events = allEvents?.filter((e) => {
    return dayjs(e.dateNumber)
      .startOf("day")
      .isSame(dayjs().startOf("day"), "day");
  });
  events?.sort((a, b) => {
    const typeA = a.eventType.toUpperCase(); // Case-insensitive sort
    const typeB = b.eventType.toUpperCase();

    if (typeA < typeB) {
      return -1;
    }
    if (typeA > typeB) {
      return 1;
    }
    return 0;
  });
  events?.sort((a, b) => {
    const isMeetingA = a.eventType.toUpperCase() === "MEETING";
    const isMeetingB = b.eventType.toUpperCase() === "MEETING";

    if (isMeetingA && !isMeetingB) return -1;
    if (!isMeetingA && isMeetingB) return 1;

    return 0;
  });
  return (
    <View style={{}}>
      <Text style={styles.nameText}>Today's Dashboard:</Text>
      {events?.length === 0 && (
        <Text style={styles.noText} adjustsFontSizeToFit numberOfLines={1}>
          No Upcomming Events!
        </Text>
      )}
      <View>
        {events?.map((e) => (
          <DashboardEventCard event={e} onPress={() => {}} />
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: screenWidth * 0.96,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    backgroundColor: COLORS.textLight,

    paddingVertical: 15,
  },
  nameText: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsSemiBold",
    fontSize: 24,
    textAlign: "center",
  },
  noText: {
    color: COLORS.textSecondary,
    fontFamily: "PoppinsBold",
    fontSize: 30,
    textAlign: "center",
  },
});
