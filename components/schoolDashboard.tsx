import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/browse.styles";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { FlatList, Text, View } from "react-native";

import { COLORS } from "@/constants/theme";
import Toast from "react-native-toast-message";
import Announcement from "./announcement";
import EventListView from "./eventListView";
import { Pager } from "./pager";

export default function SchoolDashboard() {
  const currentUser = useUserData();
  const school = currentUser?.userData.school;
  const events = useQuery(api.events.getManyEvents, {
    eventIds: school?.eventList ?? [],
  });
  const announcements = useQuery(api.announcements.getManyAnnouncements, {
    announcementIds: school?.announcementList ?? [],
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

      <Pager
        surface={false}
        pages={[
          <>
            <View style={{ alignItems: "center" }}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={styles.subHeaderTitle}
              >
                Upcoming Events
              </Text>
              <Text
                style={[
                  styles.subTitle,
                  { color: COLORS.textPrimary, fontSize: 20 },
                ]}
              >
                Tap and Hold an Event to Add
              </Text>
            </View>
            <EventListView
              events={events}
              inClub={false}
              onLongPress={handleAdd}
            />{" "}
          </>,
          <>
            <View style={{ alignItems: "center" }}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={styles.subHeaderTitle}
              >
                Recent Announcements
              </Text>
            </View>
            <View onStartShouldSetResponder={() => true}>
              <FlatList
                data={announcements}
                inverted
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item?._id.toString()}
                initialNumToRender={5}
                windowSize={5}
                maxToRenderPerBatch={5}
                renderItem={({ item }) =>
                  item ? (
                    <Announcement
                      description={item.message}
                      image={item.image}
                      dateCreated={item.datePosted}
                      eventId={item.event?._id}
                    />
                  ) : null
                }
              />
            </View>
          </>,
        ]}
      />
    </View>
  );
}
