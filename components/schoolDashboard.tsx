import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/settings.styles";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { isAdmin } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import Toast from "react-native-toast-message";
import Announcement from "./announcement";
import EventListView from "./eventListView";
import { Pager } from "./pager";

const isWeb = Platform.OS === "web";

export default function SchoolDashboard() {
  const currentUser = useUserData();
  const school = currentUser?.userData.school;
  const [activeTab, setActiveTab] = useState<"events" | "announcements">(
    "events",
  );

  const events = useQuery(api.events.getManyEvents, {
    eventIds: school?.eventList ?? [],
  });
  const announcements = useQuery(api.announcements.getManyAnnouncements, {
    announcementIds: school?.announcementList ?? [],
  });
  const fixedAnnouncements = announcements?.toReversed();

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

  const EventsContent = () => (
    <View style={{ flex: 1, width: "100%" }}>
      {!isWeb && (
        <View style={{ alignItems: "center", marginBottom: 8 }}>
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
      )}
      <EventListView
        events={events}
        inClub={false}
        onLongPress={handleAdd}
        calendarToggle={handleAdd}
        uEvents={currentUser?.userData.eventList}
      />
    </View>
  );

  const AnnouncementsContent = () => (
    <View style={{ flex: 1, width: "100%" }}>
      {!isWeb && (
        <View style={{ marginBottom: 10 }}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.subHeaderTitle}
          >
            Recent Announcements
          </Text>
        </View>
      )}
      <FlatList
        data={fixedAnnouncements}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item?._id.toString()}
        initialNumToRender={5}
        windowSize={5}
        maxToRenderPerBatch={5}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) =>
          item ? (
            <Announcement
              description={item.message}
              image={item.image}
              dateCreated={item.datePosted}
              eventId={item.event?._id}
              isAdmin={isAdmin(currentUser?.userData.role)}
              createdBy={item.postedBy}
              creatorName={item.creatorName}
              creatorPFP={item.creatorPFP}
            />
          ) : null
        }
      />
    </View>
  );

  return (
    <View style={[styles.container, { flex: 1 }]}>
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

      {isWeb ? (
        // ── web: tab switcher + side by side on wide screens ──
        <View style={{ flex: 1, width: 1280 }}>
          {/* tab pills */}
          <View style={webStyles.tabRow}>
            <Pressable
              onPress={() => setActiveTab("events")}
              style={[
                webStyles.tab,
                activeTab === "events" && webStyles.tabActive,
              ]}
            >
              <Text
                style={[
                  webStyles.tabLabel,
                  activeTab === "events" && webStyles.tabLabelActive,
                ]}
              >
                Upcoming Events
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("announcements")}
              style={[
                webStyles.tab,
                activeTab === "announcements" && webStyles.tabActive,
              ]}
            >
              <Text
                style={[
                  webStyles.tabLabel,
                  activeTab === "announcements" && webStyles.tabLabelActive,
                ]}
              >
                Announcements
                {(fixedAnnouncements?.length ?? 0) > 0 && (
                  <Text style={webStyles.tabBadge}>
                    {" "}
                    {fixedAnnouncements?.length}
                  </Text>
                )}
              </Text>
            </Pressable>
          </View>

          {/* tab content */}
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            {activeTab === "events" ? (
              <EventsContent />
            ) : (
              <AnnouncementsContent />
            )}
          </View>
        </View>
      ) : (
        // ── mobile: original pager ──
        <View style={pageStyles.pagerContainer}>
          <Pager
            surface={false}
            bottomDots={true}
            pages={[
              <View style={pageStyles.eventsPage}>
                <EventsContent />
              </View>,
              <View style={pageStyles.announcementsPage}>
                <AnnouncementsContent />
              </View>,
            ]}
          />
        </View>
      )}
    </View>
  );
}

const pageStyles = StyleSheet.create({
  pagerContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  eventsPage: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: "center",
  },
  announcementsPage: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 12,
    paddingBottom: 24,
    alignItems: "stretch",
    height: "100%",
  },
});

const webStyles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: "center",
  },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    width: 150,
    alignItems: "center",
    borderColor: COLORS.surfaceAlternate,
  },
  tabActive: {
    backgroundColor: `${COLORS.textPrimary}22`,
    borderColor: `${COLORS.textPrimary}55`,
  },
  tabLabel: {
    color: COLORS.textSecondary,
    fontFamily: "PoppinsMedium",
    fontSize: 13,
  },
  tabLabelActive: {
    color: COLORS.textPrimary,
  },
  tabBadge: {
    color: COLORS.textMuted,
    fontFamily: "PoppinsMedium",
    fontSize: 11,
  },
});
