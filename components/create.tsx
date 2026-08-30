import Tag, { availableTags } from "@/components/tag";
import { CLUB_COLORS, COLORS, getRandomColor } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/create.styles";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { Id } from "@/convex/_generated/dataModel";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView, Switch } from "react-native-gesture-handler";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { handleEventDate } from "./createEvent";
import DismissKeyboardView from "./dismissKeyboardView";
import { ManualEventCard } from "./eventCard";
import GradientButton, { MonochromeButton } from "./gradientButton";
import StylizedInput, {
  LargeStylizedInput,
  StylizedContainer,
} from "./stylizedInput";

const isWeb = Platform.OS === "web";

type props = {
  onCreate: () => void;
  editing: boolean;
  club?: Id<"clubs">;
};

export default function CreateSceenComp({ onCreate, editing, club }: props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fullClub = club
    ? useQuery(api.clubs.getClubData, { clubId: club })
    : undefined;
  const [clubTitle, setTitle] = useState(fullClub?.name ?? "");
  const [description, setDescription] = useState(fullClub?.description ?? "");
  const [clubPublic, setClubPublic] = useState(false);
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
  const handleAdd = () => setPrereqs([...prereqs, ""]);
  const handleRemove = (index: number) =>
    setPrereqs(prereqs.filter((_, i) => i !== index));

  const tryoutDatesFix = fullClub?.restricted1?.tryoutDate
    ? fullClub.restricted1.tryoutDate.map((d) => new Date(d))
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
  const [meetingDayTime, setMeetingDayTime] = useState(
    fullClub?.meetingDayTime ?? "",
  );
  const [frequency, setFrequency] = useState<number | undefined>(
    fullClub?.meetingFreq ?? undefined,
  );

  const { width } = Dimensions.get("window");
  const toggleExpanded = () => setExpanded(!expanded);

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

  let sportsTeam = selectedTags.includes("Sports");
  useEffect(() => {
    sportsTeam = selectedTags.includes("Sports");
  }, [selectedTags]);

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

  const [animPage, setAnimPage] = useState(0);
  const pageHeights = useRef<number[]>([]);
  const [currentHeight, setCurrentHeight] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    fullClub?.clubColor ?? getRandomColor(),
  );
  const restrictedAnimatedStyle = useAnimatedStyle(() => ({
    height: restricted ? withTiming(restrictedHeight) : withTiming(0),
  }));

  const frequencyOptions = [
    { label: "Daily", value: 4 },
    { label: "Weekly", value: 0 },
    { label: "Biweekly", value: 1 },
    { label: "Monthly", value: 2 },
    { label: "As Needed", value: 3 },
  ];

  const onLayout = (event: LayoutChangeEvent) => {
    const layoutHeight = event.nativeEvent.layout.height;
    if (layoutHeight !== 0 && layoutHeight !== height) setHeight(layoutHeight);
  };

  const pagesAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(-animPage * width, { duration: 300 }) },
    ],
  }));

  if (!userSchoolId) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Loading User Data...</Text>
      </View>
    );
  }

  const goToPage = (newPage: number) => {
    setAnimPage(newPage);
    setCurrentHeight(pageHeights.current[newPage] || currentHeight);
  };

  const handleCreate = async () => {
    if (!clubTitle || selectedTags.length === 0) return;
    let stringDates: string[] = [];
    if (tryoutDate && tryoutDate.length > 1) {
      for (let i = 0; i < tryoutDate.length; i++)
        stringDates[i] = tryoutDate[i].toISOString();
    }
    const isApp = restrictedType === 0;
    const isTry = restrictedType === 1;
    const isPre = restrictedType === 2;
    const isAP = restrictedType === 3; //app + pre
    try {
      await createClub({
        name: clubTitle.trim(),
        description,
        clubColor: selectedColor,
        meetingFrequency: frequency,
        location: meetingLoc,
        expandedDesc: detailedDesc,
        clubRules,
        tags: selectedTags,
        restricted,
        restrictedType: restricted ? restrictedType : undefined,
        applicationDesc: isApp || isAP ? appDescription : undefined,
        applicationLink: isApp || isAP ? appLink : undefined,
        hasDeadline: isApp || isAP ? hasDeadline : false,
        deadline: isApp || isAP ? deadline : undefined,
        tryoutDate: isTry ? stringDates : undefined,
        tryoutDesc: isTry ? tryoutDesc : undefined,
        tryoutStartTime: eventStartTime || undefined,
        tryoutEndTime: eventEndTime || undefined,
        prerequisites: isPre || isAP ? prereqs : undefined,
        currentDate,
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
      onCreate();
    } catch (error) {}
  };

  const handleSave = async () => {
    let stringDates: string[] = [];
    if (tryoutDate && tryoutDate.length > 1) {
      for (let i = 0; i < tryoutDate.length; i++)
        stringDates[i] = String(tryoutDate[i]);
    }
    const isApp = restrictedType === 0;
    const isTry = restrictedType === 1;
    const isPre = restrictedType === 2;
    const isAP = restrictedType === 3; //app + pre
    try {
      if (club) {
        await updateClub({
          clubId: club,
          clubColor: selectedColor,
          name: clubTitle,
          description,
          meetingFrequency: frequency,
          location: meetingLoc,
          expandedDesc: detailedDesc,
          clubRules,
          tags: selectedTags,
          restricted,
          restrictedType: restricted ? restrictedType : undefined,
          applicationDesc: isApp || isAP ? appDescription : undefined,
          applicationLink: isApp || isAP ? appLink : undefined,
          hasDeadline: isApp || isAP ? hasDeadline : false,
          deadline: isApp || isAP ? String(deadline) : undefined,
          tryoutDate: isTry ? stringDates : undefined,
          tryoutDesc: isTry ? tryoutDesc : undefined,
          prerequisites: isPre || isAP ? prereqs : undefined,
        });
      }
      await cleanClubs({ schoolId: userSchoolId });
      onCreate();
    } catch (error) {}
  };

  // ── shared section components ───────────────────────────────

  const BasicInfoSection = () => (
    <View style={isWeb ? webStyles.section : styles.inputsContainer}>
      <StylizedInput
        label="Club Name"
        value={clubTitle}
        onChangeText={setTitle}
        placeholder="Enter club name I.E. 'Chess Club'"
        dark={true}
        wordCapitalize={true}
      />
      <StylizedInput
        label="Short Club Description (Optional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Enter a brief description of the club"
        dark={true}
      />
      <View style={styles.tagInputContainer}>
        <Text style={[styles.tagInputLabel, { fontFamily: "InterRegular" }]}>
          Tags
        </Text>
        <Pressable onPress={toggleExpanded}>
          <View style={styles.tagInput}>
            {selectedTags.length === 0 && (
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
            <View
              style={{ position: "absolute", opacity: 0, zIndex: -1 }}
              onLayout={onLayout}
            >
              <View>
                {selectedTags.length === 0 && (
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
                {selectedTags.length === 0 && (
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

      <Pressable onPress={() => setRestricted(!restricted)}>
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
                    : restrictedType === 2
                      ? "complete prerequisites"
                      : "complete and application as well as prerequisites") +
                " to join the club"}
          </Text>
        </View>

        {isWeb ? (
          restricted && (
            <View style={styles.restrictedOptions}>
              {[
                { label: "Application", value: 0 },

                { label: "Prerequisites", value: 2 },
                { label: "Application + Prerequisites", value: 3 },
                { label: "Tryout", value: 1 },
              ].map((opt, i) => (
                <React.Fragment key={opt.value}>
                  {i > 0 && (
                    <Entypo
                      style={styles.dotIcon}
                      name="dot-single"
                      size={24}
                    />
                  )}
                  <Pressable onPress={() => setRestrictedType(opt.value)}>
                    <Text
                      style={[
                        styles.optionsText,
                        {
                          color:
                            restrictedType === opt.value
                              ? COLORS.textPrimary
                              : styles.optionsText.color,
                          fontFamily:
                            restrictedType === opt.value
                              ? "LatoBold"
                              : styles.optionsText.fontFamily,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                </React.Fragment>
              ))}
            </View>
          )
        ) : (
          <Animated.View style={[restrictedAnimatedStyle]}>
            <View style={styles.restrictedOptions}>
              {[
                { label: "Application", value: 0 },

                { label: "Prerequisites", value: 2 },
                { label: "Application + Prerequisites", value: 3 },
                { label: "Tryout", value: 1 },
              ].map((opt, i) => (
                <React.Fragment key={opt.value}>
                  {i > 0 && (
                    <Entypo
                      style={styles.dotIcon}
                      name="dot-single"
                      size={24}
                    />
                  )}
                  <Pressable onPress={() => setRestrictedType(opt.value)}>
                    <Text
                      style={[
                        styles.optionsText,
                        {
                          color:
                            restrictedType === opt.value
                              ? COLORS.textPrimary
                              : styles.optionsText.color,
                          fontFamily:
                            restrictedType === opt.value
                              ? "LatoBold"
                              : styles.optionsText.fontFamily,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                </React.Fragment>
              ))}
            </View>
          </Animated.View>
        )}
      </Pressable>
      <View style={{ height: 50 }} />
      <MonochromeButton
        onPress={() => goToPage(1)}
        title="Next"
        restricted={false}
      />
    </View>
  );

  const RestrictedSection = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      style={{ flex: isWeb ? undefined : 1 }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 0, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={isWeb ? webStyles.section : {}}>
          {restricted && (restrictedType === 0 || restrictedType === 3) && (
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
                  <View style={{ paddingHorizontal: 6 }}>
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
                    <Pressable
                      onPress={() => setDeadlineVisable(!deadlinePickerVisable)}
                    >
                      <View style={webStyles.datePicker}>
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
                            : "Tap to enter a deadline"}
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                  {deadline && (
                    <View style={{ width: "100%" }}>
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
                style={{ flex: 0, paddingHorizontal: 6, paddingVertical: 12 }}
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
                <Pressable onPress={() => setDateVisable(!datePickerVisable)}>
                  <View style={webStyles.datePicker}>
                    <Text
                      style={{
                        fontSize: 16,
                        color:
                          tryoutDate !== undefined
                            ? COLORS.textPrimary
                            : "#888",
                      }}
                    >
                      {tryoutDate && tryoutDate.length > 1
                        ? handleEventDate(String(tryoutDate[0])) +
                          " [" +
                          (tryoutDate.length - 1) +
                          " more]"
                        : tryoutDate?.[0]
                          ? handleEventDate(String(tryoutDate[0]))
                          : "Tap to enter tryout dates"}
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
                {[
                  {
                    label: "Start Time",
                    value: eventStartTime,
                    setter: setStartTimePicker,
                    visible: startTimePicker,
                    setVisible: setStartTimePicker,
                    hours: 12,
                    setTime: setEventStartTime,
                  },
                  {
                    label: "End Time",
                    value: eventEndTime,
                    setter: setEndTimePicker,
                    visible: endTimePicker,
                    setVisible: setEndTimePicker,
                    hours: 14,
                    setTime: setEventEndTime,
                  },
                ].map((timeField) => (
                  <View key={timeField.label}>
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 18,
                        marginBottom: 4,
                        fontFamily: "InterRegular",
                      }}
                    >
                      {timeField.label}
                    </Text>
                    <Pressable
                      onPress={() => timeField.setVisible(!timeField.visible)}
                    >
                      <View style={webStyles.datePicker}>
                        <Text
                          style={{
                            fontSize: 16,
                            color:
                              timeField.value.length > 0
                                ? COLORS.textPrimary
                                : "#888",
                          }}
                        >
                          {timeField.value.length > 0
                            ? timeField.value
                            : timeField.hours === 12
                              ? "12:00 PM"
                              : "2:00 PM"}
                        </Text>
                      </View>
                    </Pressable>
                    <TimePickerModal
                      visible={timeField.visible}
                      onDismiss={() => timeField.setVisible(false)}
                      onConfirm={({ hours, minutes }) => {
                        const corrHours = hours <= 12 ? hours : hours - 12;
                        const corrMinutes =
                          minutes < 10 ? "0" + minutes : minutes;
                        const ending = hours < 12 ? "AM" : "PM";
                        timeField.setTime(
                          `${corrHours}:${corrMinutes} ${ending}`,
                        );
                        timeField.setVisible(false);
                      }}
                      hours={timeField.hours}
                      minutes={0}
                    />
                  </View>
                ))}
              </View>
              {tryoutDate?.map((item, index) => (
                <ManualEventCard
                  key={String(item)}
                  category="Tryout"
                  name={clubTitle + " Tryouts Day " + (index + 1)}
                  date={String(item)}
                  inClub={true}
                  inAnnouncement={true}
                  startTime={eventStartTime}
                  endTime={eventEndTime}
                />
              ))}
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

          {restricted && (restrictedType === 2 || restrictedType === 3) && (
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
                <View key={index}>
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
                        />
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
              <Pressable onPress={handleAdd}>
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
        </View>
        <MonochromeButton
          onPress={() => goToPage(2)}
          title="Next"
          restricted={false}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const AdditionalInfoSection = () => (
    <View style={isWeb ? webStyles.section : {}}>
      <LargeStylizedInput
        value={detailedDesc}
        onChangeText={setDetailedDesc}
        dark={true}
        label="Detailed Club Description"
        placeholder={`Provide a more detailed introduction and description to the club.\nLeave blank to use the other entered description (not recommended)`}
      />
      <View style={{ height: 40 }} />
      <StylizedInput
        value={meetingLoc}
        onChangeText={setMeetingLoc}
        label={sportsTeam ? "Practice Location" : "Meeting Location (Optional)"}
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
      <View style={webStyles.pickerContainer}>
        {isWeb ? (
          <select
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            style={{
              color: COLORS.textPrimary,
              backgroundColor: "transparent",
              border: "none",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 16,
              width: "100%",
              outline: "none",
            }}
          >
            {frequencyOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                style={{ backgroundColor: COLORS.surfaceAlternate }}
              >
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <Picker
            selectedValue={frequency}
            onValueChange={(itemValue) => setFrequency(itemValue)}
            itemStyle={{ color: COLORS.textPrimary }}
            selectionColor={COLORS.surfaceAlternate}
          >
            {frequencyOptions.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        )}
      </View>
      {/*
      <Picker
          selectedValue={frequency}
          onValueChange={(itemValue: number) => setFrequency(itemValue)}
          itemStyle={{ color: COLORS.textPrimary }}
          selectionColor={COLORS.surfaceAlternate}
          style={Platform.select({
            web: { color: COLORS.textPrimary, backgroundColor: "transparent" },
          })}
        >
          <Picker.Item label="Daily" value={4} />
          <Picker.Item label="Weekly" value={0} />
          <Picker.Item label="Biweekly" value={1} />
          <Picker.Item label="Monthly" value={2} />
          <Picker.Item label="As Needed" value={3} />
        </Picker>
      */}

      <StylizedInput
        value={meetingDayTime}
        onChangeText={setMeetingDayTime}
        dark
        label="Meeting Date/Time"
        placeholder="EX: Tuesdays @ 3PM"
      />
      {/* <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",

          paddingTop: 20,
        }}
      >
        <StylizedInput
          value={meetingLoc}
          onChangeText={setMeetingLoc}
          label={"Meeting Day (Optional)"}
          placeholder={"Enter the day of the week the club meets"}
          dark={true}
          width={"50%"}
        />
        <View style={{ width: "50%" }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              marginBottom: 4,

              paddingHorizontal: 2,
              fontFamily: "InterRegular",
            }}
          >
            Meeting Time (Optional)
          </Text>
          <Pressable onPress={() => setMeetingTimePicker(!meetingTimePicker)}>
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
                  color: meetingTime.length > 0 ? COLORS.textPrimary : "#888",
                }}
              >
                {meetingTime.length > 0 ? meetingTime : "2:00 PM"}
              </Text>
            </View>
          </Pressable>
          <TimePickerModal
            visible={meetingTimePicker}
            onDismiss={() => setMeetingTimePicker(!meetingTimePicker)}
            onConfirm={({ hours, minutes }) => {
              const corrHours = hours <= 12 ? hours : hours - 12;
              const corrMinutes =
                minutes < 10 ? "0" + String(minutes) : minutes;
              const ending = hours < 12 ? "AM" : "PM";
              const stringTime =
                String(corrHours) + ":" + String(corrMinutes) + " " + ending;
              setMeetingTime(stringTime);
              setMeetingTimePicker(!meetingTimePicker);
            }}
            hours={14}
            minutes={0o0}
          />
        </View>
      </View>*/}
      <LargeStylizedInput
        value={clubRules}
        onChangeText={setClubRules}
        dark={true}
        label="Club Rules"
        placeholder="Describe the rules club members must follow"
      />

      <StylizedContainer label="Select a Club Color" dark={true}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {CLUB_COLORS.map((color) => (
            <Pressable
              key={color}
              onPress={() => setSelectedColor(color)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: color,
                borderWidth: selectedColor === color ? 3 : 0,
                borderColor: "#FFFFFF",
              }}
            />
          ))}
        </View>
      </StylizedContainer>

      <View style={{ height: 40 }} />
      <GradientButton
        onPress={editing ? handleSave : handleCreate}
        title={editing ? "Save Changes" : "Create"}
      />
    </View>
  );

  const stepTitle = () => {
    if (animPage === 0) return "Basic Info";
    if (animPage === 1 && restricted) {
      return restrictedType === 0
        ? "Student Application Options"
        : restrictedType === 1
          ? "Tryout Information"
          : "Add Prerequisites";
    }
    return "Additional Info";
  };

  const totalPages = restricted ? 3 : 2;
  const pageList = restricted
    ? [BasicInfoSection(), RestrictedSection(), AdditionalInfoSection()]
    : [BasicInfoSection(), AdditionalInfoSection()];

  return (
    <DismissKeyboardView>
      <View
        style={[
          styles.container,
          {
            flex: 1,
            marginTop: insets.top,
            marginRight: insets.right,
            marginLeft: insets.left,
            marginBottom: insets.bottom,
          },
          isWeb && { overflow: "visible" },
        ]}
      >
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {editing ? "Edit Club" : "Create a Club"}
          </Text>

          <View
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <TouchableOpacity
              onPress={() => goToPage(animPage - 1)}
              disabled={animPage === 0}
              style={{
                position: "absolute",
                left: 0,
                zIndex: 10,
                padding: 4,
              }}
            >
              <Entypo
                name="chevron-left"
                size={36}
                color={COLORS.textSecondary}
                style={{
                  opacity: animPage === 0 ? 0 : 1,
                }}
              />
            </TouchableOpacity>

            <Text
              style={{
                fontFamily: "InterMedium",
                fontSize: 28,
                color: COLORS.textPrimary,
                textAlign: "center",
              }}
            >
              {stepTitle()}
            </Text>
          </View>

          <View style={webStyles.stepIndicator}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <View
                key={i}
                style={[
                  webStyles.stepDot,
                  i === animPage && webStyles.stepDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <LinearGradient
          colors={["#12c2e9", "#c471ed", "#f64f59"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBar}
        />

        {/* page content */}
        {isWeb ? (
          // web: render current page directly, no sliding animation
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {pageList[animPage]}
          </ScrollView>
        ) : (
          // mobile: original sliding animation
          <Animated.View
            style={[
              { flexDirection: "row", width: width * pageList.length },
              pagesAnimatedStyle,
            ]}
          >
            {pageList.map((PageComp, idx) => (
              <View key={idx} style={{ width }}>
                <View>{PageComp}</View>
              </View>
            ))}
          </Animated.View>
        )}

        {!isWeb && <View style={styles.bottomMargin} />}
      </View>
    </DismissKeyboardView>
  );
}

const webStyles = StyleSheet.create({
  section: {
    paddingHorizontal: 32,
    paddingTop: 16,
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },
  datePicker: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    height: 42,
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 14,
    marginHorizontal: 6,
    marginVertical: 12,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceAlternate,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  webNavRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    paddingHorizontal: 32,
    paddingBottom: 24,
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },
});
