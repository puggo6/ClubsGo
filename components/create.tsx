import Tag, { availableTags } from "@/components/tag";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/create.styles";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { Picker } from "@react-native-picker/picker";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { Id } from "@/convex/_generated/dataModel";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ScrollView, Switch, TextInput } from "react-native-gesture-handler";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { handleEventDate } from "./createEvent";
import { ManualEventCard } from "./eventCard";
import GradientButton, { MonochromeButton } from "./gradientButton";
import StylizedInput, { LargeStylizedInput } from "./stylizedInput";

type props = {
  onCreate: () => void;
  editing: boolean;
  club?: Id<"clubs">;
};

export default function CreateSceenComp({ onCreate, editing, club }: props) {
  const router = useRouter();
  const fullClub = club
    ? useQuery(api.clubs.getClubData, { clubId: club })
    : undefined;
  const [clubTitle, setTitle] = useState(fullClub?.name ?? "");
  const [description, setDescription] = useState(fullClub?.description ?? "");

  const [clubPublic, setClubPublic] = useState(false);
  const [dummyText, setDummyText] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [startTimePicker, setStartTimePicker] = useState(false);
  const [endTimePicker, setEndTimePicker] = useState(false);

  const [selectedTags, setSelectedTags] = useState<string[]>(
    fullClub?.tags ?? [],
  );
  const initialTags = availableTags.filter(
    (t) =>
      t !== fullClub?.tags[0] &&
      t !== fullClub?.tags[1] &&
      t !== fullClub?.tags[2],
  );
  const [freeTags, setFreeTags] = useState<string[]>(initialTags);

  const [expanded, setExpanded] = useState(fullClub?.restricted ?? false);

  const [prereqs, setPrereqs] = useState(
    fullClub?.restricted2?.prerequisites ?? [""],
  );

  const handleChange = (text: string, index: number) => {
    const updated = [...prereqs];
    updated[index] = text;
    setPrereqs(updated);
  };

  const handleAdd = () => {
    setPrereqs([...prereqs, ""]);
  };

  const handleRemove = (index: number) => {
    const updated = prereqs.filter((_, i) => i !== index);
    setPrereqs(updated);
  };
  const tryoutDatesFix = fullClub?.restricted1?.tryoutDate
    ? fullClub?.restricted1?.tryoutDate.map((d) => new Date(d))
    : undefined;
  const [appDescription, setAppDescription] = useState(
    fullClub?.restricted0?.applicationDesc ?? "",
  );
  const [appLink, setAppLink] = useState(
    fullClub?.restricted0?.applicationLink ?? "",
  );
  const [hasDeadline, setHasDeadline] = useState(
    fullClub?.restricted0?.hasDeadline ?? false,
  );
  const [deadline, setDeadline] = useState<string | undefined>(
    fullClub?.restricted0?.applicationDeadline ?? undefined,
  );
  const [tryoutDesc, setTryoutDesc] = useState(
    fullClub?.restricted1?.tryoutDesc ?? "",
  );
  const [tryoutDate, setTryoutDate] = React.useState<Date[] | undefined>(
    tryoutDatesFix ?? undefined,
  );
  const [datePickerVisable, setDateVisable] = useState(false);
  const [deadlinePickerVisable, setDeadlineVisable] = useState(false);
  const [detailedDesc, setDetailedDesc] = useState(
    fullClub?.expandedDescription ?? "",
  );
  const [clubRules, setClubRules] = useState(fullClub?.clubRules ?? "");

  const [meetingLoc, setMeetingLoc] = useState(fullClub?.meetingLocation ?? "");
  const [frequency, setFrequency] = useState<number | undefined>(
    fullClub?.meetingFreq ?? undefined,
  );
  const { width } = Dimensions.get("window");
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const [restricted, setRestricted] = useState(fullClub?.restricted ?? false);
  const [restrictedType, setRestrictedType] = useState<number>(
    fullClub?.restrictedType ?? 0,
  );

  const selectTag = (tag: string) => {
    if (selectedTags.length > 2) return;
    setSelectedTags((prev) => [...prev, tag]);
    setFreeTags((prev) => prev.filter((t) => t !== tag));
  };
  const deselectTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
    setFreeTags((prev) => [...prev, tag]);
  };

  let cleanClubs = useMutation(api.schools.cleanClubListOther);

  const createClub = useMutation(api.clubs.createClub);
  const updateClub = useMutation(api.clubs.updateClubInfo);
  const currentUser = useUserData();
  const userSchoolId = currentUser?.userData.school?._id;
  const currentDate = String(dayjs());

  const [restrictedHeight, setRestrictedHeight] = useState(50);
  const [height, setHeight] = useState(0);
  let sportsTeam =
    selectedTags[0] === "Sports" ||
    selectedTags[1] === "Sports" ||
    selectedTags[2] === "Sports";
  useEffect(() => {
    sportsTeam =
      selectedTags[0] === "Sports" ||
      selectedTags[1] === "Sports" ||
      selectedTags[2] === "Sports";
  }, [selectedTags]);

  const [height, setHeight] = useState(0);
  const tagContentHeight = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    height: tagContentHeight.value,
    overflow: "hidden",
  }));

  useEffect(() => {
    tagContentHeight.value = withTiming(expanded ? height : 0, {
      duration: 220,
    });
  }, [expanded, height]);

  const pagerRef = useRef<PagerView>(null);

  const [step, setStep] = useState(0);
  const MAX_STEP = 2;
  const nextStep = () => (step < MAX_STEP ? setStep((prev) => prev + 1) : {});
  const prevStep = () => (step > 0 ? setStep((prev) => prev - 1) : {});

  const restrictedAnimatedStyle = useAnimatedStyle(() => {
    const animatedHeight = restricted
      ? withTiming(restrictedHeight)
      : withTiming(0);
    return {
      height: animatedHeight,
    };
  });
  const [height, setHeight] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => {
    const layoutHeight = event.nativeEvent.layout.height;

    if (layoutHeight !== 0 && layoutHeight !== height) {
      setHeight(layoutHeight);
    }
  };

  const [animPage, setAnimPage] = useState(0);
  const [currentHeight, setCurrentHeight] = useState(0);
  const pageHeights = useRef<number[]>([]);
  const offset = useSharedValue(0);

  const pagesAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(-animPage * width, { duration: 300 }) },
    ],
  }));

  if (!userSchoolId) {
    console.error("userSchoolId is undefined");
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Loading User Data...</Text>
      </View>
    );
  }

  const [test, setTest] = useState("");
  const testInput = () => <TextInput />;
  const handleCreate = async () => {
    if (!clubTitle || !description || selectedTags.length === 0) return; // add display which reads "missing required fields"
    let stringDates = [];
    if (tryoutDate && tryoutDate.length > 1) {
      for (let i = 0; i < tryoutDate.length; i++)
        stringDates[i] = tryoutDate[i].toISOString();
    }
    const isApp = restrictedType === 0;
    const isTry = restrictedType === 1;
    const isPre = restrictedType === 2;
    try {
      await createClub({
        name: clubTitle,
        description,
        meetingFrequency: frequency,
        location: meetingLoc,
        expandedDesc: detailedDesc,
        clubRules: clubRules,
        tags: selectedTags,

        restricted: restricted,
        restrictedType: restricted ? restrictedType : undefined,

        applicationDesc: isApp ? appDescription : undefined,
        applicationLink: isApp ? appLink : undefined,
        hasDeadline: isApp ? hasDeadline : false,
        deadline: isApp ? deadline : undefined,
        tryoutDate: isTry ? stringDates : undefined,
        tryoutDesc: isTry ? tryoutDesc : undefined,
        tryoutStartTime: eventStartTime ? eventStartTime : undefined,
        tryoutEndTime: eventEndTime ? eventEndTime : undefined,
        prerequisites: isPre ? prereqs : undefined,

        currentDate: currentDate,
      });

      await cleanClubs({ schoolId: userSchoolId });
      setTitle("");
      setDescription("");
      setSelectedTags([]);
      setFreeTags(availableTags);
      setClubPublic(false);
      setExpanded(false);
      setRestricted(false);
      setRestrictedType(0);
      setAppDescription("");
      setAppLink("");
      setDeadline("");

      console.log("created!");
      onCreate();
    } catch (error) {}
  };
  const handleSave = async () => {
    let stringDates = [];
    if (tryoutDate && tryoutDate.length > 1) {
      for (let i = 0; i < tryoutDate.length; i++)
        stringDates[i] = String(tryoutDate[i]);
    }
    const isApp = restrictedType === 0;
    const isTry = restrictedType === 1;
    const isPre = restrictedType === 2;
    try {
      if (club) {
        await updateClub({
          clubId: club,
          name: clubTitle,
          description,
          meetingFrequency: frequency,
          location: meetingLoc,
          expandedDesc: detailedDesc,
          clubRules: clubRules,
          tags: selectedTags,

          restricted: restricted,
          restrictedType: restricted ? restrictedType : undefined,

          applicationDesc: isApp ? appDescription : undefined,
          applicationLink: isApp ? appLink : undefined,
          hasDeadline: isApp ? hasDeadline : false,
          deadline: isApp ? String(deadline) : undefined,
          tryoutDate: isTry ? stringDates : undefined,
          tryoutDesc: isTry ? tryoutDesc : undefined,
          prerequisites: isPre ? prereqs : undefined,
        });
      } else throw new Error("attempted to update club without club Id");
      await cleanClubs({ schoolId: userSchoolId });

      onCreate();
    } catch (error) {}
  };
  const pages = [
    <>
      <View style={styles.inputsContainer}>
        <StylizedInput
          label="Club Name"
          value={clubTitle}
          onChangeText={setTitle}
          placeholder="Enter club name I.E. 'Chess Club'"
          dark={true}
          wordCapitalize={true}
        />
        <StylizedInput
          label="Club Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter a brief description of the club "
          dark={true}
        />
        <View style={styles.tagInputContainer}>
          <Text style={[styles.tagInputLabel, { fontFamily: "InterRegular" }]}>
            Tags
          </Text>
          <Pressable onPress={toggleExpanded}>
            <View style={styles.tagInput}>
              {selectedTags.length == 0 && (
                <Text style={{ color: "#888", fontSize: 16 }}>
                  Add tags which apply to this club (Max 3)
                </Text>
              )}
              <View style={styles.tagSelection}>
                {selectedTags.map((tag) => (
                  <Tag
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
                    <Tag category="placeholder" visable={false} />
                  )}
                  <View style={styles.divider} />
                  <View style={styles.tagSelection}>
                    {freeTags.map((tag) => (
                      <Tag
                        key={tag}
                        category={tag}
                        visable={true}
                        onPress={() => selectTag(tag)}
                      />
                    ))}
                  </View>
                </View>
              </View>

              <Animated.View style={[animatedStyle, { overflow: "hidden" }]}>
                <View>
                  {selectedTags.length == 0 && (
                    <Tag category="placeholder" visable={false} />
                  )}

                  <View style={styles.divider} />
                  <View style={styles.tagSelection}>
                    {freeTags.map((tag) => (
                      <Tag
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
        <Pressable
          onPress={() => {
            setRestricted(!restricted);
          }}
        >
          <View style={styles.restrictedContainer}>
            <View style={styles.lockContainer}>
              <Entypo
                name={restricted ? "lock" : "lock-open"}
                style={{
                  color: restricted ? COLORS.privateRed : COLORS.publicGreen,
                }}
                size={28}
              />
            </View>

            <Text style={styles.restrictedText}>
              {!restricted
                ? "The club is open to all students"
                : "Students must " +
                  (restrictedType === 0
                    ? "complete an application"
                    : restrictedType === 1
                      ? "try out"
                      : "complete prerequisites") +
                  " to join the club"}
            </Text>
          </View>
          <Animated.View style={[restrictedAnimatedStyle, {}]}>
            <View style={styles.restrictedOptions}>
              <Pressable
                onPress={() => {
                  setRestrictedType(0);
                }}
              >
                <Text
                  style={[
                    styles.optionsText,
                    {
                      color:
                        restrictedType === 0
                          ? COLORS.textPrimary
                          : styles.optionsText.color,
                      fontFamily:
                        restrictedType === 0
                          ? "LatoBold"
                          : styles.optionsText.fontFamily,
                    },
                  ]}
                >
                  Application
                </Text>
              </Pressable>
              <Entypo style={styles.dotIcon} name="dot-single" size={24} />
              <Pressable
                onPress={() => {
                  setRestrictedType(1);
                }}
              >
                <Text
                  style={[
                    styles.optionsText,
                    {
                      color:
                        restrictedType === 1
                          ? COLORS.textPrimary
                          : styles.optionsText.color,
                      fontFamily:
                        restrictedType === 1
                          ? "LatoBold"
                          : styles.optionsText.fontFamily,
                    },
                  ]}
                >
                  Tryout
                </Text>
              </Pressable>
              <Entypo style={styles.dotIcon} name="dot-single" size={24} />
              <Pressable
                onPress={() => {
                  setRestrictedType(2);
                }}
              >
                <Text
                  style={[
                    styles.optionsText,
                    {
                      color:
                        restrictedType === 2
                          ? COLORS.textPrimary
                          : styles.optionsText.color,
                      fontFamily:
                        restrictedType === 2
                          ? "LatoBold"
                          : styles.optionsText.fontFamily,
                    },
                  ]}
                >
                  Prerequisite
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Pressable>

        <MonochromeButton
          onPress={() => goToPage(restricted ? 1 : 2)}
          title="Next"
          restricted={false}
        />
      </View>
    </>,
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 0,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {restricted && restrictedType === 0 && (
            <View style={{ marginBottom: 40 }}>
              <LargeStylizedInput
                value={appDescription}
                label="Application Description"
                onChangeText={setAppDescription}
                dark={true}
                placeholder="Enter a detailed description of the application process"
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginVertical: 50,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 20,
                    marginBottom: 4,
                    fontFamily: "InterMedium",
                    paddingHorizontal: 2,
                  }}
                >
                  Application Deadline
                </Text>
                <Switch
                  value={hasDeadline}
                  onValueChange={() => setHasDeadline(!hasDeadline)}
                  trackColor={{ false: "#767577", true: COLORS.primary }}
                  style={{ marginLeft: 10 }}
                />
              </View>
              {hasDeadline && (
                <>
                  <View
                    style={{
                      flex: 0,
                      paddingHorizontal: 6,
                    }}
                  >
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
                        Deadline
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setDeadlineVisable(!deadlinePickerVisable)}
                    >
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
                              deadline !== undefined
                                ? COLORS.textPrimary
                                : "#888",
                          }}
                        >
                          {deadline
                            ? dayjs(deadline).format("dddd, MMMM DD")
                            : "Tap to enter a deadline for user applications"}
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                  {deadline && (
                    <View>
                      <ManualEventCard
                        category="Deadline"
                        name={clubTitle + " Application Deadline"}
                        date={String(deadline)}
                        inClub={true}
                        inAnnouncement={true}
                      />
                    </View>
                  )}
                  <DatePickerModal
                    locale="en"
                    mode="single"
                    visible={deadlinePickerVisable}
                    onDismiss={() => setDeadlineVisable(!deadlinePickerVisable)}
                    onConfirm={({ date }) => {
                      setDeadline(date?.toISOString());
                      setDeadlineVisable(!deadlinePickerVisable);
                    }}
                  />
                </>
              )}
              <StylizedInput
                value={appLink}
                onChangeText={setAppLink}
                label="Application Link (Optional)"
                placeholder="Enter a link for students to access the application"
                dark={true}
              />
            </View>
          )}
          {restricted && restrictedType === 1 && (
            <>
              <LargeStylizedInput
                label="Tryout Description"
                value={tryoutDesc}
                onChangeText={setTryoutDesc}
                placeholder="Enter a detailed description of the tryout process"
                dark={true}
              />
              <View style={{ height: 50 }} />
              <View
                style={{
                  flex: 0,
                  paddingHorizontal: 6,
                  paddingVertical: 12,
                }}
              >
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
                    Tryout Dates
                  </Text>
                </View>
                <Pressable onPress={() => setDateVisable(!datePickerVisable)}>
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
                          tryoutDate !== undefined
                            ? COLORS.textPrimary
                            : "#888",
                      }}
                    >
                      {tryoutDate && tryoutDate?.length > 1
                        ? handleEventDate(String(tryoutDate[0])) +
                          (tryoutDate.length > 1
                            ? "... " +
                              "[" +
                              String(tryoutDate.length - 1) +
                              " more]"
                            : "")
                        : tryoutDate && tryoutDate[0]
                          ? handleEventDate(String(tryoutDate[0]))
                          : "Tap to enter 1 or more dates for the team tryouts"}
                    </Text>
                  </View>
                </Pressable>
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
                  <Pressable
                    onPress={() => setStartTimePicker(!startTimePicker)}
                  >
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
                        {eventStartTime.length > 0
                          ? eventStartTime
                          : "12:00 PM"}
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
                            eventEndTime.length > 0
                              ? COLORS.textPrimary
                              : "#888",
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
              <View>
                {tryoutDate?.map((item, index) => (
                  <ManualEventCard
                    category="Tryout"
                    name={clubTitle + " Tryouts Day " + (index + 1)}
                    date={String(item)}
                    inClub={true}
                    inAnnouncement={true}
                    key={String(item)}
                    startTime={eventStartTime}
                    endTime={eventEndTime}
                  />
                ))}
              </View>
              <DatePickerModal
                locale="en"
                mode="multiple"
                visible={datePickerVisable}
                onDismiss={() => setDateVisable(!datePickerVisable)}
                onConfirm={({ dates }) => {
                  setTryoutDate(dates);
                  setDateVisable(!datePickerVisable);
                }}
              />
            </>
          )}

          {restricted && restrictedType === 2 && (
            <>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,

                  fontFamily: "InterRegular",
                  paddingHorizontal: 2,
                  marginLeft: 10,
                }}
              >
                Prerequisites:
              </Text>
              {prereqs.map((item, index) => (
                <View key={index} style={{}}>
                  <StylizedInput
                    value={item}
                    onChangeText={(text) => handleChange(text, index)}
                    dark={true}
                    placeholder="Tap to Edit Text..."
                  />
                  {prereqs.length > 1 && (
                    <View
                      style={{
                        alignItems: "flex-end",
                        position: "absolute",
                        width: "100%",
                        paddingBottom: 4,
                        paddingRight: 4,
                      }}
                    >
                      <Pressable onPress={() => handleRemove(index)}>
                        <MaterialIcons
                          name="highlight-remove"
                          size={24}
                          color={COLORS.textMuted}
                          style={{ alignSelf: "flex-end" }}
                        />
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
              <Pressable onPress={() => handleAdd()}>
                <View
                  style={{
                    flexDirection: "row",
                    marginHorizontal: 16,
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "PoppinsMedium",
                      fontSize: 16,
                      color: COLORS.textSecondary,
                      paddingRight: 8,
                    }}
                  >
                    Add
                  </Text>
                  <Feather
                    name="plus-circle"
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </View>
              </Pressable>
            </>
          )}
          {restricted && (
            <MonochromeButton
              onPress={() => goToPage(2)}
              title="Next"
              restricted={false}
            />
          )}
          {!restricted && <View></View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </>,
    <>
      <LargeStylizedInput
        value={detailedDesc}
        onChangeText={setDetailedDesc}
        dark={true}
        label="Detailed Club Description"
        placeholder={`Provide a more detailed introduction and description to the club - possible members will first see this when they view the club info page.\nLeave blank to indicate this remain the other entered description (not recommended)`}
      />
      <View style={{ height: 40 }} />
      <StylizedInput
        value={meetingLoc}
        onChangeText={setMeetingLoc}
        label={sportsTeam ? "Practice Location" : "Meeting Location"}
        placeholder={
          "Enter where the " + (sportsTeam ? "team practices" : "club meets")
        }
        dark={true}
      />
      <Text
        style={{
          color: "#fff",
          fontSize: 18,
          marginBottom: -6,
          fontFamily: "InterRegular",

          marginLeft: 8,
        }}
      >
        Meeting Frequency
      </Text>
      <View
        style={{
          backgroundColor: COLORS.background,
          borderWidth: 1,
          borderColor: "#2a2a2a",

          borderRadius: 14,
          marginHorizontal: 6,
          marginVertical: 12,
        }}
      >
        <Picker
          selectedValue={frequency}
          onValueChange={(itemValue: number, itemIndex: any) =>
            setFrequency(itemValue)
          }
          itemStyle={{ color: COLORS.textPrimary }}
          selectionColor={COLORS.surfaceAlternate}
        >
          <Picker.Item label="Daily" value={4} />
          <Picker.Item label="Weekly" value={0} />
          <Picker.Item label="Biweekly" value={1} />
          <Picker.Item label="Monthly" value={2} />
          <Picker.Item label="As Needed" value={3} />
        </Picker>
      </View>
      <LargeStylizedInput
        value={clubRules}
        onChangeText={setClubRules}
        dark={true}
        label="Club Rules"
        placeholder="Describe the rules club members must follow"
      />

      <View style={{ height: 40 }} />

      <GradientButton
        onPress={editing ? handleSave : handleCreate}
        title={editing ? "Save Changes" : "Create"}
      />
    </>,
  ];

  const CurrentPage = pages[animPage];
  const goToPage = (newPage: number) => {
    setAnimPage(newPage);
    const height = pageHeights.current[newPage] || currentHeight;
    setCurrentHeight(height);
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={Platform.OS === "web" ? undefined : Keyboard.dismiss}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[styles.container, { flex: 1 }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create a Club </Text>

          <View
            style={{
              flexDirection: "row",

              width: "100%",
            }}
          >
            <View
              style={{ justifyContent: "flex-start", position: "absolute" }}
            >
              <Pressable
                onPress={() => goToPage(animPage - (restricted ? 1 : 2))}
                disabled={animPage === 0}
              >
                <Entypo
                  name="chevron-left"
                  size={36}
                  color={COLORS.textSecondary}
                  style={{ opacity: animPage === 0 ? 0 : 1 }}
                />
              </Pressable>
            </View>
            <View
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "InterMedium",
                  fontSize: 28,
                  color: COLORS.textPrimary,
                  textAlign: "center",
                  width: 300,
                }}
              >
                {animPage === 0
                  ? "Basic Info"
                  : animPage === 1
                    ? restricted
                      ? restrictedType === 0
                        ? "Student Application Options"
                        : restrictedType === 1
                          ? "Tryout Information"
                          : "Add Prerequisites"
                      : ""
                    : animPage === 2
                      ? "Additional Info"
                      : ""}
              </Text>
            </View>
          </View>
        </View>
        <LinearGradient
          colors={["#12c2e9", "#c471ed", "#f64f59"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBar}
        />

        {/* Page Content start */}

        <Animated.View
          style={[
            {
              flexDirection: "row",
              width: width * pages.length,
            },
            pagesAnimatedStyle,
          ]}
        >
          {pages.map((PageComp, idx) => {
            return (
              <View key={idx} style={{ width }}>
                <View style={{}}>{PageComp}</View>
              </View>
            );
          })}
        </Animated.View>

        {/* page content end */}

        <View style={styles.bottomMargin} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

/*
<StylizedInput
          label="Tags"
          value={dummyText}
          onChangeText={setDummyText}
          placeholder="Add tags which apply to this club (Max 3)"
        />
*/

/*





*/
