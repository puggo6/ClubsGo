import ClubLogo from "@/components/clubLogo";
import CreateSceenComp from "@/components/create";
import EventCard from "@/components/eventCard";
import { SizeGradientButton } from "@/components/gradientButton";
import { TagsText } from "@/components/tag";
import { isAdmin, isParent } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/clubManagement.styles";
import { AntDesign, Entypo, EvilIcons, Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const isWeb = Platform.OS === "web";

export default function clubInfo() {
  const { clubId, isBrowsing } = useLocalSearchParams();
  const { width } = Dimensions.get("window");
  const insets = useSafeAreaInsets();
  const joinClub = useMutation(api.users.joinClub);
  const currentDate = String(dayjs());
  const user = useUserData();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const browsing = isBrowsing === "true";

  const handelJoin = async (clubId: Id<"clubs">) => {
    try {
      await joinClub({ clubId, currentDate });
      router.push("/(tabs)");
    } catch (error) {}
  };

  const requestClub = useMutation(api.users.requestJoinClub);
  const addEvent = useMutation(api.users.addEventToList);

  const handleHaptics = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleAdd = (
    event: Id<"events"> | undefined,
    club: Id<"clubs"> | undefined,
    title: string | undefined,
  ) => {
    if (!event) return;
    if (
      user?.userData.eventList?.includes(event) ||
      user?.userData.clubs.map((c) => c?._id).includes(club)
    ) {
      Toast.show({
        type: "error",
        text1: "Event Add Failed",
        text2: title + " is already in your calendar.",
        position: "top",
        visibilityTime: 2500,
        topOffset: 50,
      });
    } else {
      addEvent({ eventId: event });
      Toast.show({
        type: "success",
        text1: "Event added!",
        text2: title,
        position: "top",
        visibilityTime: 2500,
        topOffset: 50,
      });
    }
    handleHaptics();
  };

  const handleMultiAdd = (events: Doc<"events">[] | undefined) => {
    if (!events) return;
    const uniqueEvents = events.filter(
      (e) => !user?.userData.eventList?.includes(e._id),
    );
    if (uniqueEvents.length === 0) {
      Toast.show({
        type: "error",
        text1: "Event Add Failed",
        text2: "Events are already in your calendar.",
        position: "top",
        visibilityTime: 2500,
        topOffset: 50,
      });
    } else {
      for (const event of uniqueEvents) addEvent({ eventId: event._id });
      Toast.show({
        type: "success",
        text1: "Events added!",
        text2:
          uniqueEvents[0].title +
          (uniqueEvents.length > 1
            ? " +" + (uniqueEvents.length - 1) + " more"
            : ""),
        position: "top",
        visibilityTime: 2500,
        topOffset: 50,
      });
    }
    handleHaptics();
  };

  const HEADER_HEIGHT = 220;
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -HEADER_HEIGHT],
      Extrapolate.CLAMP,
    );
    return { transform: [{ translateY }] };
  });

  const club = useQuery(
    api.clubs.getClubData,
    clubId ? { clubId: clubId as Id<"clubs">, includeTryouts: true } : "skip",
  );

  const restrictedType = club?.restrictedType;
  const gradeRangeLabel = club?.gradeRange
    ? club.gradeRange.minGrade === club.gradeRange.maxGrade
      ? `Grade ${club.gradeRange.minGrade}`
      : `Grades ${club.gradeRange.minGrade} - ${club.gradeRange.maxGrade}`
    : undefined;

  const openLink = async (url: string) => {
    const isSupported = await Linking.canOpenURL(url);
    if (isSupported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Invalid link", "Cannot open this URL: " + url);
    }
  };

  const school = user?.userData.school;
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleOpenSheet = () => {
    if (isWeb) setEditModalVisible(true);
    else bottomSheetRef.current?.expand();
  };
  const handleCloseSheet = () => {
    if (isWeb) setEditModalVisible(false);
    else bottomSheetRef.current?.close();
  };

  const snapPoints = React.useMemo(() => ["25%", "50%", "75%"], []);

  const CustomBackground = ({ style }: BottomSheetBackgroundProps) => (
    <View
      style={[style, { backgroundColor: COLORS.surface, borderRadius: 20 }]}
    />
  );

  // ── shared page content (used in both web and mobile) ───────
  const PageContent = () => (
    <View style={!!isWeb && { minWidth: 1280, alignSelf: "center" }}>
      <View
        style={[
          {
            alignSelf: "center",
            justifyContent: "center",
            paddingBottom: 25,
            paddingTop: 30,
          },
          ,
        ]}
      >
        <TagsText tags={club?.tags ?? []} />
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}
      >
        <View style={styles.infoIconContainer}>
          <EvilIcons name="calendar" size={36} color={COLORS.textPrimary} />
        </View>
        <View style={{ width: "88%" }}>
          <Text
            style={styles.infoPageAccent}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            Meets{" "}
            {(club?.meetingFreq === 0
              ? "Weekly"
              : club?.meetingFreq === 1
                ? "Biweekly"
                : club?.meetingFreq === 2
                  ? "Monthly"
                  : club?.meetingFreq === 3
                    ? "As Needed"
                    : "Daily") +
              ((club?.meetingLocation?.length ?? 0 > 0)
                ? " - " +
                  club?.meetingLocation +
                  (club?.meetingDayTime ? ", " + club?.meetingDayTime : "")
                : "")}
          </Text>
        </View>
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}
      >
        <View style={styles.infoIconContainer}>
          <Entypo
            name={club?.restricted ? "lock" : "lock-open"}
            size={32}
            color={COLORS.textPrimary}
          />
        </View>
        <View style={{ width: "88%" }}>
          <Text
            style={styles.infoPageAccent}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {(club?.restricted
              ? (restrictedType === 0
                  ? "Application"
                  : restrictedType === 1
                    ? "Tryout"
                    : restrictedType === 2
                      ? "Prerequisite"
                      : "Application + Prerequisite") + "-Based"
              : "Open") + " Admission"}
          </Text>
        </View>
      </View>

      {gradeRangeLabel && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 10,
          }}
        >
          <View style={styles.infoIconContainer}>
            <Ionicons
              name="school-outline"
              size={32}
              color={COLORS.textPrimary}
            />
          </View>
          <View style={{ width: "88%" }}>
            <Text
              style={styles.infoPageAccent}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {gradeRangeLabel}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.infoPageText}>{club?.expandedDescription}</Text>

      {club?.restricted && (
        <Text
          style={styles.infoSubheaderText}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          Membership Requirements
        </Text>
      )}
      {(restrictedType === 0 || restrictedType === 3) && (
        <>
          <Text style={styles.infoPageText}>
            {club?.restricted0?.applicationDesc}
          </Text>
          {club?.restricted0?.applicationDeadline && club.eventList[0] && (
            <View>
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    fontFamily: "InterRegular",
                    fontSize: 20,
                    color: COLORS.textSecondary,
                  }}
                >
                  {"Deadline - "}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    handleAdd(
                      club.eventList[0]?._id,
                      club.eventList[0]?.clubId,
                      club.eventList[0]?.title,
                    )
                  }
                >
                  <Text
                    style={[
                      styles.linkText,
                      { fontFamily: "InterRegular", fontSize: 20 },
                    ]}
                  >
                    {"Add to Calendar"}
                  </Text>
                </TouchableOpacity>
              </View>
              <EventCard
                event={club.eventList[0]}
                inClub={true}
                inAnnouncement={true}
                key={club.eventList[0]._id}
                onEvent={false}
                onLongPress={() =>
                  handleAdd(
                    club.eventList[0]?._id,
                    club.eventList[0]?.clubId,
                    club.eventList[0]?.title,
                  )
                }
              />
            </View>
          )}
          {club?.restricted0?.applicationLink && (
            <TouchableOpacity
              onPress={() => openLink(club?.restricted0?.applicationLink ?? "")}
            >
              <Text style={styles.linkText}>Tap to open Application</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {restrictedType === 1 && (
        <>
          <Text style={styles.infoPageText}>
            {club?.restricted1?.tryoutDesc}
          </Text>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Text
              style={{
                fontFamily: "InterRegular",
                fontSize: 20,
                color: COLORS.textSecondary,
              }}
            >
              {"Tryout Dates - "}
            </Text>
            <TouchableOpacity
              onPress={
                club?.restricted1.tryoutIds
                  ? () =>
                      handleMultiAdd(
                        club?.restricted1.tryoutIds?.filter((e) => e !== null),
                      )
                  : () => {}
              }
            >
              <Text
                style={[
                  styles.linkText,
                  { fontFamily: "InterRegular", fontSize: 20 },
                ]}
              >
                {"Add All to Calendar"}
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            {club?.restricted1?.tryoutIds?.map((item) =>
              item ? (
                <EventCard
                  event={item}
                  inClub={true}
                  inAnnouncement={true}
                  key={item._id}
                  onEvent={false}
                  onLongPress={() =>
                    handleAdd(item?._id, item?.clubId, item?.title)
                  }
                />
              ) : null,
            )}
          </View>
        </>
      )}

      {(restrictedType === 2 || restrictedType === 3) && (
        <View style={{ flexDirection: "column" }}>
          {club?.restricted2?.prerequisites.map((p) => (
            <Text key={p} style={[styles.infoPageText, { marginVertical: 4 }]}>
              {"\t"}-{p}
            </Text>
          ))}
        </View>
      )}

      {!!club?.clubRules && (
        <>
          <Text
            style={[styles.infoSubheaderText, { marginTop: 20 }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            Club Rules
          </Text>
          <Text style={styles.infoPageText}>{club?.clubRules}</Text>
        </>
      )}

      <View
        style={{
          marginTop: 20,
          marginHorizontal: 30,
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        {!!club?._id &&
          (!isParent(user?.userData?.role) ? (
            <>
              <SizeGradientButton
                onPress={() => handelJoin(club._id)}
                title={
                  club.configurations?.membersNeedApproval
                    ? "Request to Join"
                    : "Join"
                }
                width={8}
                height={6}
                restricted={
                  isAdmin(user?.userData.role) &&
                  (!club.clubPublic || !user?.userData.approvedAdmin)
                }
              />
              {isAdmin(user?.userData.role) &&
                (!club?.clubPublic || !user?.userData.approvedAdmin) && (
                  <Text style={styles.infoText}>
                    {!user?.userData.approvedAdmin
                      ? "You cannot join any clubs until approved by a head administrator."
                      : club.name.trim() +
                        " is not currently accepting any new members at this time."}
                  </Text>
                )}
            </>
          ) : (
            <Text style={styles.infoText}>
              {"You cannot join clubs as a parent."}
            </Text>
          ))}
      </View>
    </View>
  );

  // ── web layout ───────────────────────────────────────────────
  if (isWeb) {
    return (
      <View style={{ backgroundColor: COLORS.background, flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,

            alignSelf: "center",
            width: "100%",
          }}
        >
          {/* web header — static, part of scroll */}
          <View
            style={[
              webStyles.header,
              {
                height: HEADER_HEIGHT,
                backgroundColor: club?.clubColor ?? COLORS.grey,
              },
            ]}
          >
            <Pressable
              onPress={
                !isBrowsing
                  ? () =>
                      router.push({
                        pathname: "/club/clubManagement",
                        params: { clubId: club?._id.toString(), tabIndex: 0 },
                      })
                  : () => router.back()
              }
              // @ts-ignore
              style={{ cursor: "pointer", marginLeft: 30 }}
            >
              <Ionicons
                name="arrow-back"
                size={28}
                color={COLORS.textPrimary}
              />
            </Pressable>

            <View style={webStyles.headerCenter}>
              <Text
                style={webStyles.clubName}

                numberOfLines={1}
              >
                {club?.name}
              </Text>
              {/*club && (
                <View
                  style={{ bottom: -20, alignItems: "center", zIndex: 100 }}
                >
                  <ClubLogo
                    clubN={club.name}
                    image={club.logoImage ? club.logoImage : undefined}
                    color={COLORS.textPrimary}
                  />
                </View>
              )*/}
            </View>

            {/* edit button aligned to right of header */}
            {isAdmin(user?.userData.role) &&
            club?.advisors?.includes(user?.userData._id) &&
            user?.userData.school ? (
              <TouchableOpacity onPress={handleOpenSheet} activeOpacity={0.5}>
                <View style={webStyles.editButton}>
                  <AntDesign name="edit" size={20} color="white" />
                </View>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} /> // spacer to keep header centered
            )}
          </View>
          <View style={{ maxWidth: 1200, alignSelf: "center" }}>
            <PageContent />
          </View>
        </ScrollView>

        {/* edit modal */}
        {school && club && (
          <Modal
            visible={editModalVisible}
            transparent
            animationType="fade"
            onRequestClose={handleCloseSheet}
          >
            <Pressable
              style={webStyles.modalBackdrop}
              onPress={handleCloseSheet}
            >
              <Pressable
                style={webStyles.modalContent}
                onPress={(e) => e.stopPropagation()}
              >
                <CreateSceenComp
                  onCreate={handleCloseSheet}
                  editing={true}
                  club={club._id}
                />
              </Pressable>
            </Pressable>
          </Modal>
        )}
      </View>
    );
  }

  // ── mobile layout (unchanged) ────────────────────────────────
  return (
    <View
      style={{
        backgroundColor: COLORS.background,
        flex: 1,
        paddingTop: insets.top,
        paddingRight: insets.right,
        paddingLeft: insets.left,
      }}
    >
      <Animated.View
        style={[
          styles.infoHeader,
          {
            height: HEADER_HEIGHT,
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
          },
          headerAnimatedStyle,
        ]}
      >
        <View
          style={{
            justifyContent: "center",
            position: "absolute",
            height: "100%",
            alignItems: "center",
            marginBottom: 45,
          }}
        >
          <Pressable onPress={() => router.back()}>
            <View
              style={{
                width,
                alignItems: "flex-start",
                justifyContent: "flex-start",
                paddingLeft: 15,
                top: -20,
              }}
            >
              <Ionicons
                name="arrow-back"
                size={36}
                color={COLORS.textPrimary}
              />
            </View>
          </Pressable>
          <View
            style={{
              justifyContent: "center",
              position: "absolute",
              height: "100%",
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 48,
                color: COLORS.textPrimary,
                fontFamily: "PoppinsBold",
                textAlign: "center",
                position: "absolute",
                width: "95%",
                top: 110,
              }}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {club?.name}
            </Text>
          </View>
        </View>
        <View style={[styles.iconContainer, { top: 50 }]}>
          {club && (
            <ClubLogo
              clubN={club.name}
              image={club.logoImage ? club.logoImage : undefined}
            />
          )}
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 180, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <PageContent />
      </Animated.ScrollView>

      {isAdmin(user?.userData.role) &&
        club?.advisors?.includes(user?.userData._id) &&
        user?.userData.school && (
          <View
            style={{
              alignItems: "flex-end",
              justifyContent: "flex-end",
              flex: 1,
            }}
          >
            <TouchableOpacity onPress={handleOpenSheet} activeOpacity={0.5}>
              <View style={[styles.createButton]}>
                <AntDesign name="edit" size={35} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        )}

      {school && club && (
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          style={{ backgroundColor: COLORS.surface }}
          backgroundStyle={{
            backgroundColor: COLORS.surface,
            borderRadius: 20,
          }}
          backgroundComponent={CustomBackground}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
        >
          <BottomSheetScrollView style={{ paddingBottom: 30 }}>
            <CreateSceenComp
              onCreate={handleCloseSheet}
              editing={true}
              club={club._id}
            />
          </BottomSheetScrollView>
        </BottomSheet>
      )}
    </View>
  );
}

const webStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    gap: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 12,
  },
  clubName: {
    fontSize: 48,
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    textAlign: "center",
  },

  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceAlternate,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 30,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: 640,
    maxHeight: "90%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
});
