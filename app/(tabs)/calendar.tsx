import Calendar from "@/components/calendar";
import EventCard from "@/components/eventCard";
import EventListView from "@/components/eventListView";
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
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function calendar() {
  const currentUser = useUserData();

  const role = currentUser?.userData.role;
  let masterClubs = currentUser?.userData.clubs ?? [];
  const insets = useSafeAreaInsets();

  const fullSchoolClubs =
    useQuery(api.clubs.getClubList, {
      clubList: currentUser?.userData.school?.clubList ?? [],
    }) ?? [];
  if (isHeadAdmin(role)) {
    masterClubs = fullSchoolClubs;
  }

  const childrenIds = currentUser?.userData?.approvedChildren
    ?.map((c) => c?._id)
    .filter(Boolean) as Id<"users">[];

  const rawChildClubs = useQuery(api.clubs.getChildrensClubs, {
    userList: childrenIds ?? [],
  });
  const childClubs = rawChildClubs?.map((c) => c?.club);

  if (isParent(role) && childClubs) {
    masterClubs = childClubs;
  }
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
  console.log(eventIds, "eventId");
  const events = useQuery(api.events.getManyEvents, {
    eventIds: eventIds,
  });
  console.log(events, "events");
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
      : []
  );

  const [selectedDay, setSelectedDay] = useState(dayjs());
  const [currentCalDate, setCurrentCalDate] = useState(dayjs());
  const selectedEvents = events
    ? events.filter((event) =>
        dayjs(event?.dateNumber).isSame(selectedDay, "day")
      )
    : [];

  const dayEventMap = () => {};

  const [pressedDay, setPressedDay] = useState<Dayjs | undefined>(undefined);
  const [onCalendar, setOnCalendar] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const openSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const snapPoints = useMemo(() => ["20%", "33%", "50%"], []);

  const CustomBackground = ({ style }: BottomSheetBackgroundProps) => (
    <View
      style={[
        style,
        {
          backgroundColor: COLORS.surface,
          borderRadius: 20,
        },
      ]}
    />
  );

  return (
    <View
      style={[
        styles.pageContainer,
        {
          paddingBottom: 200,
          paddingTop: insets.top,
          marginBottom: 0,
          marginRight: insets.right,
          marginLeft: insets.left,
        },
      ]}
    >
      <View style={styles.pageHeader}>
        <Text style={[styles.headerTitle]}>Calendar</Text>
        <Text style={[styles.subTitle]}>Tap and Hold an Event to Remove</Text>
      </View>
      <LinearGradient
        colors={["#12c2e9", "#c471ed", "#f64f59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />
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
              bottomSheetRef.current ? bottomSheetRef.current.close() : null;
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
      {onCalendar && (
        <Calendar
          admin={true}
          eventList={eventDaySet}
          onCellPress={(day) => {
            if (pressedDay?.isSame(day, "day")) {
              bottomSheetRef.current ? bottomSheetRef.current.close() : null;
              setPressedDay(undefined);
            } else setPressedDay(day);
            setSelectedDay(day);
            openSheet();
          }}
          pressedDay={pressedDay}
          currentInputDate={currentCalDate}
          onMonthChange={(newDate) => setCurrentCalDate(newDate)}
        />
      )}
      {!onCalendar && (
        <View style={{ paddingBottom: 50 }}>
          <EventListView
            events={
              events
                ? events.filter((e): e is Doc<"events"> => e !== null)
                : undefined
            }
            inClub={false}
            inCreation={false}
            onLongPress={handleRemove}
            inCalendar={true}
          />
        </View>
      )}

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
        onClose={() => {
          setPressedDay(undefined);
        }}
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
            {selectedEvents &&
              selectedEvents.length > 0 &&
              selectedEvents?.map((event) => (
                <EventCard
                  key={event?._id}
                  event={event ? event : undefined}
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
    </View>
  );
}
