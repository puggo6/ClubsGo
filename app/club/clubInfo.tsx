// File for info regarding access to restricted clubs, not to be confused with the info tab in clubMangement
import ClubLogo from "@/components/clubLogo";
import CreateSceenComp from "@/components/create";
import EventCard from "@/components/eventCard";
import { SizeGradientButton } from "@/components/gradientButton";
import { TagsText } from "@/components/tag";
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
import React, { useRef } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function clubInfo() {
  const { clubId } = useLocalSearchParams();
  const { width, height } = Dimensions.get("window");
  const insets = useSafeAreaInsets();
  const joinClub = useMutation(api.users.joinClub);
  const currentDate = String(dayjs());
  const user = useUserData();
  const isAdmin = user?.userData.role === "administrator";

  const handelJoin = async (clubId: Id<"clubs">) => {
    try {
      await joinClub({ clubId, currentDate });
    } catch (error) {
      console.log("Error joining club:", error);
    }
  };

  const requestClub = useMutation(api.users.requestJoinClub);

  const addEvent = useMutation(api.users.addEventToList);
  const handleHaptics = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };
  const handleAdd = (
    event: Id<"events"> | undefined,
    club: Id<"clubs"> | undefined,
    title: string | undefined
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
      (e) => !user?.userData.eventList?.includes(e._id)
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
      for (const event of uniqueEvents) {
        addEvent({ eventId: event._id });
      }
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
  const handleRequest = async (clubId: Id<"clubs">) => {
    try {
      await requestClub({ clubId });
      router.back();
    } catch (error) {
      console.log("Error joining club:", error);
    }
  };
  const club = useQuery(
    api.clubs.getClubData,
    clubId
      ? {
          clubId: clubId as Id<"clubs">,
        }
      : "skip"
  );

  const tag1 = club?.tags[0];
  const tag2 = club?.tags[1];
  const tag3 = club?.tags[2];
  const restrictedType = club?.restrictedType;
  const openLink = async (url: string) => {
    // make sure the user typed something valid
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
    bottomSheetRef.current?.expand(); // opens to the first snap point
  };
  const handleCloseSheet = () => {
    bottomSheetRef.current?.close(); // opens to the first snap point
  };

  const snapPoints = ["25%", "50%", "75%"];

  const screenWidth = Dimensions.get("window").width;
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
        styles.container,
        {
          paddingTop: insets.top,
          paddingRight: insets.right,
          paddingLeft: insets.left,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={[styles.infoHeader, { height: 220 }]}>
        <View
          style={{
            justifyContent: "center",
            position: "absolute",
            height: "100%",
            width: "100%",
            alignItems: "center",
            marginBottom: 45,
          }}
        >
          <Pressable
            onPress={() => {
              router.back();
            }}
          >
            <View
              style={{
                width: width,
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
                top: 100,
              }}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {club?.name}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.iconContainer,
            {
              top: 50,
            },
          ]}
        >
          {club && (
            <ClubLogo
              clubN={club.name}
              image={club.logoImage ? club.logoImage : undefined}
            />
          )}
        </View>
      </View>
      <Pressable
        onPress={() => {
          router.back();
        }}
      >
        <Text style={styles.leaveText}>Back to Home</Text>
      </Pressable>
      <View style={{ height: 30 }} />

      {/*
      {tag1 && (
          <View style={{ flex: 1, alignItems: "center" }}>
            <Tag category={tag1} visable={true} />
          </View>
        )}
        {tag2 && (
          <View style={{ flex: 1, alignItems: "center" }}>
            <Tag category={tag2} visable={true} />
          </View>
        )}
        {tag3 && (
          <View style={{ flex: 1, alignItems: "center" }}>
            <Tag category={tag3} visable={true} />
          </View>
        )}
      */}

      <ScrollView>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 25,
            paddingTop: 2,
          }}
        >
          <TagsText tags={club?.tags ?? []} />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 10,
          }}
        >
          <View style={styles.infoIconContainer}>
            <EvilIcons name="calendar" size={36} color={COLORS.textPrimary} />
          </View>
          <View style={{ width: "88%" }}>
            <Text
              style={styles.infoPageAccent}
              adjustsFontSizeToFit={true}
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
                " - " +
                club?.meetingLocation}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 10,
          }}
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
              adjustsFontSizeToFit={true}
              numberOfLines={1}
            >
              {(club?.restricted
                ? (restrictedType === 0
                    ? "Application"
                    : restrictedType === 1
                      ? "Tryout"
                      : "Prerequisite") + "-Based"
                : "Open") + " Admission"}
            </Text>
          </View>
        </View>
        <Text style={styles.infoPageText}>{club?.expandedDescription}</Text>

        <Text
          style={styles.infoSubheaderText}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          Membership Requirements
        </Text>
        {restrictedType === 0 && (
          <>
            <Text style={styles.infoPageText}>
              {club?.restricted0?.applicationDesc}
            </Text>
            {club?.restricted0?.applicationDeadline && club.eventList[0] && (
              <View>
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
                      club.eventList[0]?.title
                    )
                  }
                />
              </View>
            )}
            {club?.restricted0?.applicationLink && (
              <TouchableOpacity
                onPress={() =>
                  openLink(club?.restricted0?.applicationLink ?? "")
                }
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
                Tryout Dates -
              </Text>
              <TouchableOpacity
                onPress={
                  club?.restricted1.tryoutIds
                    ? () =>
                        handleMultiAdd(
                          club?.restricted1.tryoutIds?.filter((e) => e !== null)
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
                  Add All to Calendar
                </Text>
              </TouchableOpacity>
            </View>
            <View>
              {club?.restricted1?.tryoutIds &&
                club?.restricted1?.tryoutIds.map((item) => {
                  return (
                    <>
                      {item && (
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
                      )}
                    </>
                  );
                })}
            </View>
          </>
        )}
        {restrictedType === 2 && (
          <View style={{ flexDirection: "column" }}>
            {club?.restricted2?.prerequisites.map((p) => (
              <Text
                key={p}
                style={[styles.infoPageText, { marginVertical: 4 }]}
              >
                {"\t"}-{p}
              </Text>
            ))}
          </View>
        )}
        <Text
          style={styles.infoSubheaderText}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          Club Rules
        </Text>
        <Text style={styles.infoPageText}>{club?.clubRules}</Text>
        <View
          style={{
            marginTop: 50,
            marginHorizontal: 30,
            justifyContent: "center",
          }}
        >
          {club?._id && (
            <SizeGradientButton
              onPress={
                club.restricted
                  ? () => handleRequest(club?._id)
                  : () => handelJoin(club?._id)
              }
              title={club.restricted ? "Request to Join" : "Join"}
              width={8}
              height={6}
              restricted={false}
            />
          )}
        </View>
      </ScrollView>
      {(user?.userData.role === "administrator" ||
        user?.userData.role === "superAdmin") &&
        club?.advisors?.includes(user.userData._id) &&
        user?.userData.school && (
          <View
            style={{
              alignItems: "flex-end",
              justifyContent: "flex-end",
              flex: 1,
              marginBottom: 80,
            }}
          >
            <TouchableOpacity
              onPress={() => handleOpenSheet()}
              activeOpacity={0.5}
            >
              <View style={[styles.createButton]}>
                <AntDesign name="edit" size={35} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        )}
      {school && (
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
              club={club?._id}
            />
          </BottomSheetScrollView>
        </BottomSheet>
      )}
    </View>
  );
}
