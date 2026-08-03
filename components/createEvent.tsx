import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/clubManagement.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  LayoutChangeEvent,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Switch } from "react-native-gesture-handler";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import EventTag, { availableEventTags } from "./eventTag";
import { SizeGradientButton } from "./gradientButton";
import StylizedInput from "./stylizedInput";

type props = {
  inputClub?: Id<"clubs">;
  back?: () => void;
  error?: () => void;
};

type editProps = {
  inputEvent: Id<"events">;
  back: () => void;
};

export default function CreateEvent({ inputClub, back, error }: props) {
  const [startedCreate, setStartedCreate] = useState(false);
  const [local, setLocal] = useState(true); // !local would indicate a global event (local events are club-scoped, global events are school-scoped)

  const [eventTitle, setEventTitle] = useState("");
  const currentUser = useUserData();
  const currentSchool = useQuery(api.schools.getSchoolData, {
    schoolId: currentUser?.userData.school?._id,
  });
  const [hasDescription, setHasDescription] = useState(false);
  const [eventDescription, setEventDescription] = useState("");

  const [eventDate, setEventDate] = React.useState<Date | undefined>(
    new Date()
  );
  const [dateArray, setDateArray] = React.useState<Date[] | undefined>(
    undefined
  );
  const [eventDateNum, setEventDateNum] = useState("");
  const [selectedClub, setSelectedClub] = useState<Id<"clubs"> | undefined>(
    undefined
  );

  const [datePickerVisable, setDatePickerVisable] = useState(false);
  const [startTimePicker, setStartTimePicker] = useState(false);
  const [endTimePicker, setEndTimePicker] = useState(false);

  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventType, setEventType] = useState("Placeholder");
  const [multiDate, setMultiDate] = useState(false);

  let today = new Date();
  const handleLocal = (global: number) => {
    if (global == 1) setLocal(false);
    else setLocal(true);
    console.log("local: ", local);
  };
  const createNewEvent = useMutation(api.events.createEvent);
  const createGlobalEvent = useMutation(api.events.createGlobEvent);
  const [isFocus, setIsFocus] = useState(false);
  const handleCreateEvent = async () => {
    setStartedCreate(true);
    console.log("started create event ", eventDate, eventTitle, eventType);
    if (!eventDate || !eventTitle || !eventType || !selectedClub) {
      setStartedCreate(false);
      error ? error() : null;
      return;
    }
    const correctStartTime =
      eventStartTime.length > 0 ? eventStartTime : undefined;
    const correctEndTime = eventEndTime.length > 0 ? eventEndTime : undefined;
    const correctLocation =
      eventLocation.length > 0 ? eventLocation : undefined;
    const correctDate = handleEventDate(String(eventDate));
    const numDate = eventDate.toISOString();
    console.log(
      "before event create: ",
      correctStartTime,
      " ",
      correctEndTime,
      " ",
      correctDate,
      " ",
      correctLocation,
      " ",
      numDate,
      " ",
      eventTitle,
      " ",
      eventType,
      " ",
      selectedClub
    );
    if (dateArray && local && (inputClub || selectedClub)) {
      for (let i = 0; i < dateArray.length; i++) {
        const date = dateArray[i];
        const correctDate = handleEventDate(String(date));
        await createNewEvent({
          clubId: (inputClub ?? selectedClub)!,
          title: eventTitle,
          description: eventDescription,
          startTime: correctStartTime,
          endTime: correctEndTime,
          location: correctLocation,
          dateString: correctDate,
          dateNum: date.toISOString(),
          eventType: eventType,
        });
      }
      console.log("1 - local multi event");
    } else if (dateArray) {
      for (let i = 0; i < dateArray.length; i++) {
        const date = dateArray[i];
        const correctDate = handleEventDate(String(date));
        await createGlobalEvent({
          title: eventTitle,
          description: eventDescription,
          startTime: correctStartTime,
          endTime: correctEndTime,
          location: correctLocation,
          dateString: correctDate,
          dateNum: date.toISOString(),
          eventType: eventType,
          club: (inputClub ?? selectedClub)!,
        });
      }
      console.log("2 - glob multi event");
    } else if (local && (inputClub || selectedClub)) {
      await createNewEvent({
        clubId: (inputClub ?? selectedClub)!,
        title: eventTitle,
        description: eventDescription,
        startTime: correctStartTime,
        endTime: correctEndTime,
        location: correctLocation,
        dateString: correctDate,
        dateNum: numDate,
        eventType: eventType,
      });
      console.log("3 - local single event");
    } else {
      await createGlobalEvent({
        title: eventTitle,
        description: eventDescription,
        startTime: correctStartTime,
        endTime: correctEndTime,
        location: correctLocation,
        dateString: correctDate,
        dateNum: numDate,
        eventType: eventType,
        club: (inputClub ?? selectedClub)!,
      });
      console.log("4 - glob single event");
    }
    back ? back() : {};
  };

  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const [height, setHeight] = useState(0);

  const animatedStyle = useAnimatedStyle(() => {
    const animatedHeight = expanded ? withTiming(height) : withTiming(0);
    return {
      height: animatedHeight,
    };
  });

  const onLayout = (event: LayoutChangeEvent) => {
    const layoutHeight = event.nativeEvent.layout.height;

    if (layoutHeight > 0 && Math.abs(layoutHeight - height) > 1) {
      setHeight(layoutHeight);
    }
  };

  const renderItem = (item: any) => {
    return (
      <View
        style={{
          padding: 17,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ flex: 1, fontSize: 16, color: COLORS.textSecondary }}>
          {item.label}
        </Text>
      </View>
    );
  };

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeTags, setFreeTags] = useState<string[]>(availableEventTags);
  const selectTag = (tag: string) => {
    if (selectedTags.length > 0) return;
    setSelectedTags((prev) => [...prev, tag]);
    setFreeTags((prev) => prev.filter((t) => t !== tag));
    setEventType(tag);
  };
  const deselectTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
    setFreeTags((prev) => [...prev, tag]);
  };

  const dropdownClubs =
    currentUser?.userData.role === "superAdmin"
      ? currentSchool?.clubs?.map((c) => {
          return { label: c?.name, value: c?._id };
        })
      : currentUser?.userData.clubs.map((c) => {
          return { label: c?.name, value: c?._id };
        });

  return (
    <TouchableWithoutFeedback
      onPressIn={Platform.OS === "web" ? undefined : Keyboard.dismiss}
      style={{ flex: 1 }}
    >
      <View style={{ paddingBottom: !back ? 60 : 0 }}>
        <View style={styles.header}>
          <Text style={styles.modalTitle}>Create an Event</Text>
        </View>
        <View
          style={[
            styles.divider,
            {
              backgroundColor: COLORS.textMuted,
              width: 280,
              alignSelf: "center",
              marginBottom: -10,
            },
          ]}
        />
        <View style={styles.modalInputs}>
          {!inputClub && (
            <View>
              <View
                style={{
                  marginVertical: 10,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity onPress={() => handleLocal(0)}>
                  <Text
                    style={[
                      styles.globalOpt,
                      { color: local ? COLORS.textPrimary : COLORS.textMuted },
                    ]}
                  >
                    Local
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.globalOpt, { color: COLORS.textMuted }]}>
                  -
                </Text>
                <TouchableOpacity onPress={() => handleLocal(1)}>
                  <Text
                    style={[
                      styles.globalOpt,
                      { color: !local ? COLORS.textPrimary : COLORS.textMuted },
                    ]}
                  >
                    Global
                  </Text>
                </TouchableOpacity>
              </View>
              <View>
                <Text style={styles.globalDesc}>
                  {local
                    ? "Students in the club will be able to view this event"
                    : "All students in the school will be able to view this event"}
                </Text>
              </View>
              {!inputClub && (
                <Dropdown
                  style={{
                    height: 50,
                    borderColor: "gray",
                    borderWidth: 0.5,
                    borderRadius: 8,
                    marginHorizontal: 10,
                    paddingHorizontal: 8,
                    backgroundColor: COLORS.background,
                  }}
                  selectedTextStyle={{
                    fontSize: 16,
                    color: COLORS.textPrimary,
                  }}
                  placeholderStyle={{
                    fontSize: 16,
                    color: COLORS.textPlaceholder,
                  }}
                  activeColor={COLORS.background}
                  containerStyle={{
                    backgroundColor: COLORS.background,
                    borderColor: "grey",

                    borderWidth: 1,
                  }}
                  placeholder="Select a Club"
                  itemTextStyle={{ color: COLORS.textPrimary }}
                  inputSearchStyle={{
                    height: 40,
                    fontSize: 16,
                    borderColor: COLORS.surfaceLight,
                  }}
                  labelField="label"
                  valueField="value"
                  data={dropdownClubs ?? []}
                  search
                  searchPlaceholder="Search..."
                  renderItem={renderItem}
                  maxHeight={300}
                  value={selectedClub}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={(item) => {
                    setSelectedClub(item.value);
                  }}
                />
              )}
            </View>
          )}

          <StylizedInput
            value={eventTitle}
            onChangeText={setEventTitle}
            label="Event Name"
            dark={true}
          />
          <StylizedInput
            value={eventLocation}
            onChangeText={setEventLocation}
            label="Event Location (Optional)"
            placeholder="EX: Syosset High School Turf"
            dark={true}
          />
          <StylizedInput
            value={eventDescription}
            onChangeText={setEventDescription}
            label="Event Description (Optional)"
            placeholder="Meet on the front lawn 45 minutes early"
            dark={true}
          />

          <View style={{ flex: 0, paddingHorizontal: 6, paddingVertical: 12 }}>
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  marginBottom: 4,

                  paddingHorizontal: 2,
                  fontFamily: "InterRegular",
                }}
              >
                Event Date
              </Text>
            </View>
            <Pressable onPress={() => setDatePickerVisable(!datePickerVisable)}>
              <View
                style={{
                  backgroundColor: "#121212",
                  borderWidth: 1,
                  borderColor: "#2a2a2a",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 14,
                  height: 42,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: eventDate ? COLORS.textPrimary : "#888",
                  }}
                >
                  {dateArray
                    ? handleEventDate(String(dateArray[0])) +
                      (dateArray.length > 1
                        ? "... " + "[" + String(dateArray.length - 1) + " more]"
                        : "")
                    : eventDate
                      ? handleEventDate(String(eventDate))
                      : "No"}
                </Text>
              </View>
            </Pressable>
            {!multiDate && (
              <DatePickerModal
                locale="en"
                mode="single"
                visible={datePickerVisable}
                onDismiss={() => setDatePickerVisable(!datePickerVisable)}
                date={eventDate}
                onConfirm={({ date }) => {
                  setEventDate(date);
                  setDateArray(undefined);
                  setDatePickerVisable(!datePickerVisable);
                }}
              />
            )}
            {multiDate && (
              <DatePickerModal
                locale="en"
                mode="multiple"
                visible={datePickerVisable}
                onDismiss={() => setDatePickerVisable(!datePickerVisable)}
                onConfirm={({ dates }) => {
                  setDateArray(dates);
                  setDatePickerVisable(!datePickerVisable);
                }}
              />
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  marginBottom: 4,
                  fontFamily: "InterRegular",
                  paddingHorizontal: 2,
                }}
              >
                Multi Date
              </Text>
              <Switch
                onValueChange={() => setMultiDate(!multiDate)}
                value={multiDate}
                trackColor={{ false: "#767577", true: COLORS.primary }}
                style={{ marginLeft: 10 }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 20,
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    marginBottom: 4,

                    paddingHorizontal: 2,
                    fontFamily: "InterRegular",
                  }}
                >
                  Start Time
                </Text>
                <Pressable onPress={() => setStartTimePicker(!startTimePicker)}>
                  <View
                    style={{
                      backgroundColor: "#121212",
                      borderWidth: 1,
                      borderColor: "#2a2a2a",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 14,
                      height: 42,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color:
                          eventStartTime.length > 0
                            ? COLORS.textPrimary
                            : "#888",
                      }}
                    >
                      {eventStartTime.length > 0 ? eventStartTime : "12:00 PM"}
                    </Text>
                  </View>
                </Pressable>
                <TimePickerModal
                  visible={startTimePicker}
                  onDismiss={() => setStartTimePicker(!startTimePicker)}
                  onConfirm={({ hours, minutes }) => {
                    const corrHours = hours <= 12 ? hours : hours - 12;
                    const corrMinutes =
                      minutes < 10 ? "0" + String(minutes) : minutes;
                    const ending = hours < 12 ? "AM" : "PM";
                    const stringTime =
                      String(corrHours) +
                      ":" +
                      String(corrMinutes) +
                      " " +
                      ending;
                    setEventStartTime(stringTime);
                    setStartTimePicker(false);
                  }}
                  hours={12}
                  minutes={0o0}
                />
              </View>
              <View>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    marginBottom: 4,

                    paddingHorizontal: 2,
                    fontFamily: "InterRegular",
                  }}
                >
                  End Time
                </Text>
                <Pressable onPress={() => setEndTimePicker(!endTimePicker)}>
                  <View
                    style={{
                      backgroundColor: "#121212",
                      borderWidth: 1,
                      borderColor: "#2a2a2a",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 14,
                      height: 42,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color:
                          eventEndTime.length > 0 ? COLORS.textPrimary : "#888",
                      }}
                    >
                      {eventEndTime.length > 0 ? eventEndTime : "2:00 PM"}
                    </Text>
                  </View>
                </Pressable>
                <TimePickerModal
                  visible={endTimePicker}
                  onDismiss={() => setEndTimePicker(!endTimePicker)}
                  onConfirm={({ hours, minutes }) => {
                    const corrHours = hours <= 12 ? hours : hours - 12;
                    const corrMinutes =
                      minutes < 10 ? "0" + String(minutes) : minutes;
                    const ending = hours < 12 ? "AM" : "PM";
                    const stringTime =
                      String(corrHours) +
                      ":" +
                      String(corrMinutes) +
                      " " +
                      ending;
                    setEventEndTime(stringTime);
                    setEndTimePicker(!endTimePicker);
                  }}
                  hours={14}
                  minutes={0o0}
                />
              </View>
            </View>
            <View style={styles.tagInputContainer}>
              <Text
                style={[styles.tagInputLabel, { fontFamily: "InterRegular" }]}
              >
                Event Tag
              </Text>
              <Pressable onPress={toggleExpanded}>
                <View style={styles.tagInput}>
                  {selectedTags.length == 0 && (
                    <Text style={{ color: "#888", fontSize: 16 }}>
                      Select the Event Type
                    </Text>
                  )}
                  <View style={styles.tagSelection}>
                    {selectedTags.map((tag) => (
                      <EventTag
                        key={tag}
                        category={tag}
                        visable={true}
                        onPress={() => deselectTag(tag)}
                      />
                    ))}
                  </View>

                  {/* Placeholder render to get the expanded height (for reanimated expansion)*/}
                  <View
                    style={{ position: "absolute", opacity: 0, zIndex: -1 }}
                    onLayout={onLayout}
                  >
                    <View>
                      {selectedTags.length == 0 && (
                        <EventTag category="placeholder" visable={false} />
                      )}
                      <View style={styles.divider} />
                      <View style={styles.tagSelection}>
                        {freeTags.map((tag) => (
                          <EventTag
                            key={tag}
                            category={tag}
                            visable={true}
                            onPress={() => selectTag(tag)}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Animated.View
                    style={[animatedStyle, { overflow: "hidden" }]}
                  >
                    <View>
                      {selectedTags.length == 0 && (
                        <EventTag category="placeholder" visable={false} />
                      )}

                      <View style={styles.divider} />
                      <View style={styles.tagSelection}>
                        {freeTags.map((tag) => (
                          <EventTag
                            key={tag}
                            category={tag}
                            visable={true}
                            onPress={() => selectTag(tag)}
                          />
                        ))}
                      </View>
                    </View>
                  </Animated.View>
                </View>
              </Pressable>
            </View>
          </View>
          <View style={{ paddingHorizontal: 50, marginBottom: 40 }}>
            <SizeGradientButton
              onPress={handleCreateEvent}
              title="Create"
              width={30}
              height={7}
              horizontalPadding={20}
              disabled={startedCreate}
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
export function EditEvent({ inputEvent, back }: editProps) {
  const [startedCreate, setStartedCreate] = useState(false);
  const [local, setLocal] = useState(true); // !local would indicate a global event (local events are club-scoped, global events are school-scoped)
  const event = useQuery(api.events.getEvent, { eventId: inputEvent });

  const inputClub = event?.clubId;
  const [eventTitle, setEventTitle] = useState("");
  const currentUser = useUserData();

  const [eventDescription, setEventDescription] = useState(
    event?.description ?? ""
  );

  const [eventDate, setEventDate] = React.useState<Date | undefined>(
    event?.dateNumber ? new Date(event?.dateNumber) : new Date()
  );
  const [dateArray, setDateArray] = React.useState<Date[] | undefined>(
    undefined
  );

  const [selectedClub, setSelectedClub] = useState<Id<"clubs"> | undefined>(
    undefined
  );

  const [datePickerVisable, setDatePickerVisable] = useState(false);
  const [startTimePicker, setStartTimePicker] = useState(false);
  const [endTimePicker, setEndTimePicker] = useState(false);

  const [eventStartTime, setEventStartTime] = useState(event?.startTime ?? "");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventType, setEventType] = useState(event?.eventType ?? "Placeholder");
  const [multiDate, setMultiDate] = useState(false);
  useEffect(() => {
    setEventTitle(event?.title ?? "");
    setEventDescription(event?.description ?? "");
    setEventDate(event?.dateNumber ? new Date(event?.dateNumber) : new Date());
    setEventLocation(event?.location ?? "");
    setEventStartTime(event?.startTime ?? "");
    setEventEndTime(event?.endTime ?? "");
    setEventType(event?.eventType ?? "");
    event?.eventType && !eventType ? selectTag(event?.eventType) : {};
  }, [event]);
  let today = new Date();
  const handleLocal = (global: number) => {
    if (global == 1) setLocal(false);
    else setLocal(true);
    console.log("local: ", local);
  };
  const editEvent = useMutation(api.events.editEvent);

  const [isFocus, setIsFocus] = useState(false);
  const handleEdit = async () => {
    if (!eventDate || !eventTitle || !eventType) {
      setStartedCreate(false);
      throw new Error("missing required fields");
    }
    const correctStartTime =
      eventStartTime.length > 0 ? eventStartTime : undefined;
    const correctEndTime = eventEndTime.length > 0 ? eventEndTime : undefined;
    const correctLocation =
      eventLocation.length > 0 ? eventLocation : undefined;
    const correctDate = handleEventDate(String(eventDate));
    const numDate = eventDate.toISOString();
    await editEvent({
      eventId: inputEvent,
      description: eventDescription ?? "",
      startTime: correctStartTime,
      endTime: correctEndTime,
      location: correctLocation,
      dateNum: numDate,
      dateString: correctDate,
      title: eventTitle,
      eventType: eventType,
    });
    back();
  };

  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const [height, setHeight] = useState(0);

  const animatedStyle = useAnimatedStyle(() => {
    const animatedHeight = expanded ? withTiming(height) : withTiming(0);
    return {
      height: animatedHeight,
    };
  });

  const onLayout = (event: LayoutChangeEvent) => {
    const layoutHeight = event.nativeEvent.layout.height;

    if (layoutHeight > 0 && Math.abs(layoutHeight - height) > 1) {
      setHeight(layoutHeight);
    }
  };

  const renderItem = (item: any) => {
    return (
      <View
        style={{
          padding: 17,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ flex: 1, fontSize: 16, color: COLORS.textSecondary }}>
          {item.label}
        </Text>
      </View>
    );
  };

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeTags, setFreeTags] = useState<string[]>(availableEventTags);
  const selectTag = (tag: string) => {
    if (selectedTags.length > 0 || selectedTags.includes(tag)) return;
    setSelectedTags((prev) => [...prev, tag]);
    setFreeTags((prev) => prev.filter((t) => t !== tag));
    setEventType(tag);
  };
  const deselectTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
    setFreeTags((prev) => [...prev, tag]);
  };

  const dropdownClubs = currentUser?.userData.clubs.map((c) => {
    return { label: c?.name, value: c?._id };
  });

  return (
    <TouchableWithoutFeedback
      onPressIn={Platform.OS === "web" ? undefined : Keyboard.dismiss}
      style={{ flex: 1 }}
    >
      <View style={{ paddingBottom: !back ? 60 : 0 }}>
        <View style={styles.header}>
          {inputClub && back && (
            <TouchableOpacity
              onPress={back}
              style={{
                justifyContent: "flex-start",
                position: "absolute",
                width: 350,
                marginLeft: 15,
                marginTop: 10,
              }}
            >
              <Ionicons
                name={"arrow-back"}
                size={30}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
          )}
          <Text style={styles.modalTitle}>Edit Event</Text>
        </View>
        <View
          style={[
            styles.divider,
            {
              backgroundColor: COLORS.textMuted,
              width: 280,
              alignSelf: "center",
              marginBottom: -10,
            },
          ]}
        />
        <View style={styles.modalInputs}>
          {!inputClub && (
            <View>
              <View
                style={{
                  marginVertical: 10,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity onPress={() => handleLocal(0)}>
                  <Text
                    style={[
                      styles.globalOpt,
                      { color: local ? COLORS.textPrimary : COLORS.textMuted },
                    ]}
                  >
                    Local
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.globalOpt, { color: COLORS.textMuted }]}>
                  -
                </Text>
                <TouchableOpacity onPress={() => handleLocal(1)}>
                  <Text
                    style={[
                      styles.globalOpt,
                      { color: !local ? COLORS.textPrimary : COLORS.textMuted },
                    ]}
                  >
                    Global
                  </Text>
                </TouchableOpacity>
              </View>
              <View>
                <Text style={styles.globalDesc}>
                  {local
                    ? "Students in the club will be able to view this event"
                    : "All students in the school will be able to view this event"}
                </Text>
              </View>
              {!inputClub && (
                <Dropdown
                  style={{
                    height: 50,
                    borderColor: "gray",
                    borderWidth: 0.5,
                    borderRadius: 8,
                    marginHorizontal: 10,
                    paddingHorizontal: 8,
                    backgroundColor: COLORS.background,
                  }}
                  selectedTextStyle={{
                    fontSize: 16,
                    color: COLORS.textPrimary,
                  }}
                  placeholderStyle={{
                    fontSize: 16,
                    color: COLORS.textPlaceholder,
                  }}
                  activeColor={COLORS.background}
                  containerStyle={{
                    backgroundColor: COLORS.background,
                    borderColor: "grey",

                    borderWidth: 1,
                  }}
                  placeholder="Select a Club"
                  itemTextStyle={{ color: COLORS.textPrimary }}
                  inputSearchStyle={{
                    height: 40,
                    fontSize: 16,
                    borderColor: COLORS.surfaceLight,
                  }}
                  labelField="label"
                  valueField="value"
                  data={dropdownClubs ?? []}
                  search
                  searchPlaceholder="Search..."
                  renderItem={renderItem}
                  maxHeight={300}
                  value={selectedClub}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={(item) => {
                    setSelectedClub(item.value);
                  }}
                />
              )}
            </View>
          )}

          <StylizedInput
            value={eventTitle}
            onChangeText={setEventTitle}
            label="Event Name"
            dark={true}
          />
          <StylizedInput
            value={eventLocation}
            onChangeText={setEventLocation}
            label="Event Location (Optional)"
            placeholder="EX: Syosset High School Turf"
            dark={true}
          />
          <StylizedInput
            value={eventDescription}
            onChangeText={setEventDescription}
            label="Event Description (Optional)"
            placeholder="Meet on the front lawn 45 minutes early"
            dark={true}
          />

          <View style={{ flex: 0, paddingHorizontal: 6, paddingVertical: 12 }}>
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  marginBottom: 4,

                  paddingHorizontal: 2,
                  fontFamily: "InterRegular",
                }}
              >
                Event Date
              </Text>
            </View>
            <Pressable onPress={() => setDatePickerVisable(!datePickerVisable)}>
              <View
                style={{
                  backgroundColor: "#121212",
                  borderWidth: 1,
                  borderColor: "#2a2a2a",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 14,
                  height: 42,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: eventDate ? COLORS.textPrimary : "#888",
                  }}
                >
                  {dateArray
                    ? handleEventDate(String(dateArray[0])) +
                      (dateArray.length > 1
                        ? "... " + "[" + String(dateArray.length - 1) + " more]"
                        : "")
                    : eventDate
                      ? handleEventDate(String(eventDate))
                      : "No"}
                </Text>
              </View>
            </Pressable>
            {!multiDate && (
              <DatePickerModal
                locale="en"
                mode="single"
                visible={datePickerVisable}
                onDismiss={() => setDatePickerVisable(!datePickerVisable)}
                date={eventDate}
                onConfirm={({ date }) => {
                  setEventDate(date);
                  setDateArray(undefined);
                  setDatePickerVisable(!datePickerVisable);
                }}
              />
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 20,
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    marginBottom: 4,

                    paddingHorizontal: 2,
                    fontFamily: "InterRegular",
                  }}
                >
                  Start Time
                </Text>
                <Pressable onPress={() => setStartTimePicker(!startTimePicker)}>
                  <View
                    style={{
                      backgroundColor: "#121212",
                      borderWidth: 1,
                      borderColor: "#2a2a2a",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 14,
                      height: 42,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color:
                          eventStartTime.length > 0
                            ? COLORS.textPrimary
                            : "#888",
                      }}
                    >
                      {eventStartTime.length > 0 ? eventStartTime : "12:00 PM"}
                    </Text>
                  </View>
                </Pressable>
                <TimePickerModal
                  visible={startTimePicker}
                  onDismiss={() => setStartTimePicker(!startTimePicker)}
                  onConfirm={({ hours, minutes }) => {
                    const corrHours = hours <= 12 ? hours : hours - 12;
                    const corrMinutes =
                      minutes < 10 ? "0" + String(minutes) : minutes;
                    const ending = hours < 12 ? "AM" : "PM";
                    const stringTime =
                      String(corrHours) +
                      ":" +
                      String(corrMinutes) +
                      " " +
                      ending;
                    setEventStartTime(stringTime);
                    setStartTimePicker(false);
                  }}
                  hours={12}
                  minutes={0o0}
                />
              </View>
              <View>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    marginBottom: 4,

                    paddingHorizontal: 2,
                    fontFamily: "InterRegular",
                  }}
                >
                  End Time
                </Text>
                <Pressable onPress={() => setEndTimePicker(!endTimePicker)}>
                  <View
                    style={{
                      backgroundColor: "#121212",
                      borderWidth: 1,
                      borderColor: "#2a2a2a",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 14,
                      height: 42,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color:
                          eventEndTime.length > 0 ? COLORS.textPrimary : "#888",
                      }}
                    >
                      {eventEndTime.length > 0 ? eventEndTime : "2:00 PM"}
                    </Text>
                  </View>
                </Pressable>
                <TimePickerModal
                  visible={endTimePicker}
                  onDismiss={() => setEndTimePicker(!endTimePicker)}
                  onConfirm={({ hours, minutes }) => {
                    const corrHours = hours <= 12 ? hours : hours - 12;
                    const corrMinutes =
                      minutes < 10 ? "0" + String(minutes) : minutes;
                    const ending = hours < 12 ? "AM" : "PM";
                    const stringTime =
                      String(corrHours) +
                      ":" +
                      String(corrMinutes) +
                      " " +
                      ending;
                    setEventEndTime(stringTime);
                    setEndTimePicker(!endTimePicker);
                  }}
                  hours={14}
                  minutes={0o0}
                />
              </View>
            </View>
            <View style={styles.tagInputContainer}>
              <Text
                style={[styles.tagInputLabel, { fontFamily: "InterRegular" }]}
              >
                Event Tag
              </Text>
              <Pressable onPress={toggleExpanded}>
                <View style={styles.tagInput}>
                  {selectedTags.length == 0 && (
                    <Text style={{ color: "#888", fontSize: 16 }}>
                      Select the Event Type
                    </Text>
                  )}
                  <View style={styles.tagSelection}>
                    {selectedTags.map((tag) => (
                      <EventTag
                        key={tag}
                        category={tag}
                        visable={true}
                        onPress={() => deselectTag(tag)}
                      />
                    ))}
                  </View>

                  {/* Placeholder render to get the expanded height (for reanimated expansion)*/}
                  <View
                    style={{ position: "absolute", opacity: 0, zIndex: -1 }}
                    onLayout={onLayout}
                  >
                    <View>
                      {selectedTags.length == 0 && (
                        <EventTag category="placeholder" visable={false} />
                      )}
                      <View style={styles.divider} />
                      <View style={styles.tagSelection}>
                        {freeTags.map((tag) => (
                          <EventTag
                            key={tag}
                            category={tag}
                            visable={true}
                            onPress={() => selectTag(tag)}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Animated.View
                    style={[animatedStyle, { overflow: "hidden" }]}
                  >
                    <View>
                      {selectedTags.length == 0 && (
                        <EventTag category="placeholder" visable={false} />
                      )}

                      <View style={styles.divider} />
                      <View style={styles.tagSelection}>
                        {freeTags.map((tag) => (
                          <EventTag
                            key={tag}
                            category={tag}
                            visable={true}
                            onPress={() => selectTag(tag)}
                          />
                        ))}
                      </View>
                    </View>
                  </Animated.View>
                </View>
              </Pressable>
            </View>
          </View>
          <View style={{ paddingHorizontal: 50, marginBottom: 40 }}>
            <SizeGradientButton
              onPress={handleEdit}
              title="Save Changes"
              width={30}
              height={7}
              horizontalPadding={20}
              disabled={startedCreate}
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

/*
<DatePickerModal
          locale="en"
          mode="single"
          visible={open}
          onDismiss={onDismissSingle}
          date={date}
          onConfirm={onConfirmSingle}
        />
*/
const dayNameKey: { [key: string]: string } = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export function getDayName(day: string): string {
  return dayNameKey[day] || "undefined";
}

const monthNameKey: { [key: string]: string } = {
  Jan: "Janurary",
  Feb: "Feburary",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};

export function getMonthName(month: string): string {
  return monthNameKey[month] || "undefined";
}

const monthNumberKey: { [key: string]: number } = {
  Janurary: 1,
  Feburary: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

export function getMonthNumber(month: string): number {
  return monthNumberKey[month] || 0;
}

export function dateToDateNum(date: string) {
  let ret = "";
  let monthNum = String(getMonthNumber(getMonthName(date.substring(4, 7))));
  if (monthNum.length == 1) monthNum = "0" + monthNum;
  ret += monthNum + "/";
  ret += String(date.substring(8, 10)) + "/" + String(date.substring(11, 15));
  return ret;
}

export const handleEventDate = (rawDate: string) => {
  let ret = "";
  ret += getDayName(rawDate.substring(0, 3));
  ret += ", ";
  ret += getMonthName(rawDate.substring(4, 7));
  ret += " ";
  ret += rawDate.substring(8, 10);
  return ret;
};
