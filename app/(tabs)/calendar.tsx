import Calendar from "@/components/calendar";
import EventCard from "@/components/eventCard";
import EventListView from "@/components/eventListView";
import WebCalendar from "@/components/webCalendar";
import { isHeadAdmin, isParent } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/calendar.styles";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import dayjs, { Dayjs } from "dayjs";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const isWeb = Platform.OS === "web";

export default function calendar() {
  const currentUser = useUserData();
  const role = currentUser?.userData.role;
  let masterClubs = currentUser?.userData.clubs ?? [];
  const insets = useSafeAreaInsets();

  const fullSchoolClubs =
    useQuery(api.clubs.getClubList, {
      clubList: currentUser?.userData.school?.clubList ?? [],
    }) ?? [];

  if (isHeadAdmin(role) && currentUser?.userData.approvedAdmin)
    masterClubs = fullSchoolClubs;

  const childrenIds = currentUser?.userData?.approvedChildren
    ?.map((c) => c?._id)
    .filter(Boolean) as Id<"users">[];

  const rawChildClubs = useQuery(api.clubs.getChildrensClubs, {
    userList: childrenIds ?? [],
  });
  const childClubs = rawChildClubs?.map((c) => c?.club);

  if (isParent(role) && childClubs) masterClubs = childClubs;

  const clubIds = masterClubs.flatMap((club) => (club ? club.eventList : []));
  let uEventIds = [...clubIds, ...(currentUser?.userData.eventList ?? [])];
  let eventIds: typeof uEventIds = [];

  if (isParent(role)) {
    const clubIds = masterClubs.flatMap((club) => (club ? club.eventList : []));
    eventIds = [...clubIds];
    for (const child of currentUser?.userData.approvedChildren ?? []) {
      eventIds = [...eventIds, ...(child?.eventList ?? [])];
    }
  } else {
    eventIds = uEventIds;
  }

  const eventsA = useQuery(api.events.getManyEvents, { eventIds });
  const events = eventsA?.filter(
    (event, index, self) =>
      index === self.findIndex((e) => e._id === event._id),
  );
  const handleHaptics = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const removeEvent = useMutation(api.users.removeEventFromList);
  const handleRemove = (event: Doc<"events">) => {
    if (currentUser?.userData.eventList?.includes(event._id)) {
      removeEvent({ eventId: event._id });
      Toast.show({
        type: "success",
        text1: "Event Removed!",
        text2: event.title,
        position: "top",
        visibilityTime: 2500,
        topOffset: 50,
      });
    } else if (event.global) {
      Toast.show({
        type: "error",
        text1: "Event Remove Failed",
        text2: event.title + " is part of a joined club's calendar.",
        position: "top",
        visibilityTime: 2500,
        topOffset: 50,
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Event Remove Failed",
        text2: event.title + " is not global.",
        position: "top",
        visibilityTime: 2500,
        topOffset: 50,
      });
    }
    handleHaptics();
  };

  const eventDaySet = new Set(
    events
      ? events.map((event) => dayjs(event?.dateNumber).format("YYYY-MM-DD"))
      : [],
  );

  const [selectedDay, setSelectedDay] = useState(dayjs());
  const [currentCalDate, setCurrentCalDate] = useState(dayjs());
  const [pressedDay, setPressedDay] = useState<Dayjs | undefined>(undefined);
  const [onCalendar, setOnCalendar] = useState(false);

  const selectedEvents = events
    ? events.filter((event) =>
        dayjs(event?.dateNumber).isSame(selectedDay, "day"),
      )
    : [];

  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSheetChanges = useCallback((index: number) => {}, []);
  const openSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);
  const snapPoints = useMemo(() => ["20%", "33%", "50%"], []);

  const CustomBackground = ({ style }: BottomSheetBackgroundProps) => (
    <View
      style={[style, { backgroundColor: COLORS.surface, borderRadius: 20 }]}
    />
  );

  const handleDayPress = (day: Dayjs) => {
    if (pressedDay?.isSame(day, "day")) {
      if (!isWeb) bottomSheetRef.current?.close();
      setPressedDay(undefined);
    } else {
      setPressedDay(day);
      if (!isWeb) openSheet();
    }
    setSelectedDay(day);
  };

  const routeToManager = (club: Id<"clubs"> | undefined) => {
    if (club) {
      router.push({
        pathname: "/club/clubManagement",
        params: { clubId: club.toString(), tabIndex: 0 },
      });
    }
  };

  const routeDocToManager = (event: Doc<"events"> | undefined) => {
    if (event && event.clubId) {
      router.push({
        pathname: "/club/clubManagement",
        params: { clubId: event?.clubId.toString(), tabIndex: 0 },
      });
    }
  };

  const WebEventPanel = () => (
    <View style={webStyles.eventPanel}>
      <Text style={webStyles.panelTitle}>
        {pressedDay ? pressedDay.format("dddd, MMMM D") : "Select a Day"}
      </Text>
      <View style={webStyles.panelDivider} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {pressedDay ? (
          selectedEvents.length > 0 ? (
            selectedEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                inClub={false}
                onEvent={true}
                onPress={() => routeToManager(event?.clubId)}
                onLongPress={() => handleRemove(event)}
                global={
                  event.global &&
                  currentUser?.userData.eventList?.includes(event._id)
                }
              />
            ))
          ) : (
            <Text style={webStyles.emptyText}>
              No events scheduled for this day.
            </Text>
          )
        ) : (
          <Text style={webStyles.emptyText}>
            Tap a day on the calendar to see its events.
          </Text>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View
      style={[
        styles.pageContainer,
        {
          paddingBottom: !isWeb ? 200 : 0,
          paddingTop: insets.top,
          marginBottom: 0,
          marginRight: insets.right,
          marginLeft: insets.left,
        },
      ]}
    >
      {/* header */}
      <View style={styles.pageHeader}>
        <Text style={styles.headerTitle}>Calendar</Text>
        {!isWeb && (
          <Text style={styles.subTitle}>Tap and Hold an Event to Remove</Text>
        )}
      </View>
      <LinearGradient
        colors={["#12c2e9", "#c471ed", "#f64f59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />

      {/* view toggle */}

      {!isWeb ? (
        <View style={{ alignItems: "flex-end", marginRight: 15 }}>
          <View style={{ flexDirection: "row" }}>
            <Pressable
              onPress={() => {
                setPressedDay(undefined);
                setOnCalendar(true);
              }}
            >
              <Ionicons
                name="calendar"
                color={onCalendar ? COLORS.textPrimary : COLORS.textMuted}
                size={35}
                style={{ paddingHorizontal: 10 }}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                if (!isWeb) bottomSheetRef.current?.close();
                setPressedDay(undefined);
                setOnCalendar(false);
              }}
            >
              <Ionicons
                name="list"
                color={!onCalendar ? COLORS.textPrimary : COLORS.textMuted}
                size={40}
              />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{ alignItems: "flex-end", marginRight: 15 }}>
          <View style={{ flexDirection: "row" }}>
            <Pressable
              onPress={() => {
                if (!isWeb) bottomSheetRef.current?.close();
                setPressedDay(undefined);
                setOnCalendar(false);
              }}
            >
              <Ionicons
                name="list"
                color={!onCalendar ? COLORS.textPrimary : COLORS.textMuted}
                size={40}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                setPressedDay(undefined);
                setOnCalendar(true);
              }}
            >
              <Ionicons
                name="calendar"
                color={onCalendar ? COLORS.textPrimary : COLORS.textMuted}
                size={35}
                style={{ paddingHorizontal: 10 }}
              />
            </Pressable>
          </View>
        </View>
      )}

      {isWeb ? (
        <>
          {onCalendar ? (
            <View style={webStyles.calendarRow}>
              <View style={webStyles.calendarContainer}>
                <Calendar
                  admin={true}
                  eventList={eventDaySet}
                  onCellPress={handleDayPress}
                  pressedDay={pressedDay}
                  currentInputDate={currentCalDate}
                  onMonthChange={(newDate) => setCurrentCalDate(newDate)}
                />
              </View>
              <WebEventPanel />
            </View>
          ) : (
            <WebCalendar
              events={events ?? []}
              onEventPress={routeDocToManager}
              onEventLongPress={handleRemove}
              removal={true}
              children={currentUser?.userData.approvedChildren
                .map((c) => c?._id)
                .filter((c) => c !== undefined)}
            />
          )}
        </>
      ) : onCalendar ? (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
          }}
        >
          <Calendar
            admin={true}
            eventList={eventDaySet}
            onCellPress={handleDayPress}
            pressedDay={pressedDay}
            currentInputDate={currentCalDate}
            onMonthChange={(newDate) => setCurrentCalDate(newDate)}
          />
        </View>
      ) : (
        <EventListView
          events={
            events
              ? events.filter((e): e is Doc<"events"> => e !== null)
              : undefined
          }
          inClub={false}
          inCreation={false}
          onPress={routeDocToManager}
          onLongPress={handleRemove}
          inCalendar={true}
          childrenIds={childrenIds}
        />
      )}

      {!isWeb && (
        <BottomSheet
          ref={bottomSheetRef}
          handleIndicatorStyle={{ backgroundColor: COLORS.textSecondary }}
          onChange={handleSheetChanges}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          style={{ backgroundColor: COLORS.surface }}
          backgroundStyle={{
            backgroundColor: COLORS.surface,
            borderRadius: 20,
          }}
          backgroundComponent={CustomBackground}
          onClose={() => setPressedDay(undefined)}
        >
          <BottomSheetView
            style={{
              flex: 1,
              padding: 0,
              alignItems: "flex-start",
              backgroundColor: COLORS.surface,
            }}
          >
            <View>
              {selectedEvents?.map((event) => (
                <EventCard
                  key={event?._id}
                  event={event ?? undefined}
                  inClub={false}
                  onEvent={true}
                  onLongPress={() => handleRemove(event)}
                  global={
                    event.global &&
                    currentUser?.userData.eventList?.includes(event._id)
                  }
                />
              ))}
            </View>
          </BottomSheetView>
        </BottomSheet>
      )}
    </View>
  );
}

const webStyles = StyleSheet.create({
  calendarRow: {
    flex: 1,
    flexDirection: "row",
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 12,
    alignItems: "flex-start",
  },
  calendarContainer: {
    flex: 1,
  },
  eventPanel: {
    width: 600,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    maxHeight: 600,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  panelTitle: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    fontSize: 15,
    marginBottom: 10,
  },
  panelDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceAlternate,
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: "OpenSansRegular",
    fontSize: 13,
    textAlign: "center",
    marginTop: 24,
  },
});
