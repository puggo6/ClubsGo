import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/browse.styles";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

import { COLORS } from "@/constants/theme";
import Toast from "react-native-toast-message";
import EventListView from "./eventListView";

export default function SchoolDashboard() {
  const currentUser = useUserData();
  const school = currentUser?.userData.school;
  const events = useQuery(api.events.getManyEvents, {
    eventIds: school?.eventList ?? [],
  });
  const handleHaptics = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };
  const addEvent = useMutation(api.users.addEventToList);
  const handleAdd = (event: Doc<"events">) => {
    if (
      currentUser?.userData.eventList?.includes(event._id) ||
      currentUser?.userData.clubs.map((c) => c?._id).includes(event.clubId)
    ) {
      Toast.show({
        type: "error",
        text1: "Event Add Failed",
        text2: event.title + " is already in your calendar.",
        position: "top",
        visibilityTime: 2500,
        topOffset: 50,
      });
    } else {
      addEvent({ eventId: event._id });
      Toast.show({
        type: "success",
        text1: "Event added!",
        text2: event.title,
        position: "top",
        visibilityTime: 2500,
        topOffset: 50,
      });
    }
    handleHaptics();
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.headerTitle}>
          School Dashboard
        </Text>
      </View>
      <LinearGradient
        colors={["#12c2e9", "#c471ed", "#f64f59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />
      <View style={{ alignItems: "center" }}>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        <Text
          style={[
            styles.subTitle,
            { color: COLORS.textPrimary, fontSize: 18, paddingHorizontal: 10 },
          ]}
        >
          Tap and Hold an Event to Add to Calender!
        </Text>
      </View>
      <EventListView events={events} inClub={false} onLongPress={handleAdd} />
    </View>
  );
}
