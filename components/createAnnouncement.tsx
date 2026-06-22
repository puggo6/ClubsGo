import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useClubData } from "@/hooks/useClubData";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/clubManagement.styles";
import { Ionicons } from "@expo/vector-icons";
import { useConvex, useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  LayoutChangeEvent,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import EventCard from "./eventCard";
import { EventListMap } from "./eventListView";
import { SizeGradientButton } from "./gradientButton";
import { LargeStylizedInput } from "./stylizedInput";

type props = {
  inputClub?: Id<"clubs">;
  trigger: number;
  back: () => void;
};

export default function CreateAnnouncement({
  inputClub,
  trigger,
  back,
}: props) {
  const currentUser = useUserData();
  const [selectedImage, setSelectedImage] = useState("");
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [AnnMessage, setMessage] = useState("");
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const [selectedEvent, setSelectedEvent] = useState<Doc<"events"> | undefined>(
    undefined
  );
  const [selectedClub, setSelectedClub] = useState<Id<"clubs"> | undefined>(
    undefined
  );
  const isHeadAdmin = currentUser?.userData.role === "headAdmin";
  let masterClubs = currentUser?.userData.clubs ?? [];

  if (isHeadAdmin && currentUser.userData.school?.clubList)
    masterClubs =
      useQuery(api.clubs.getClubList, {
        clubList: currentUser.userData.school?.clubList,
      }) ?? [];

  const clubIds = masterClubs.flatMap((club) => (club ? club.eventList : []));
  const eventIds = [...clubIds, ...(currentUser?.userData.eventList ?? [])];
  const events = useQuery(api.events.getManyEvents, {
    eventIds: eventIds,
  });
  const handleEventAdd = (event: Doc<"events">) => {
    setSelectedEvent(event);
    browsingEvents.value = false;
  };
  const [local, setLocal] = useState(true);
  const handleLocal = (global: number) => {
    if (global == 1) setLocal(false);
    else setLocal(true);
    console.log("local: ", local);
  };
  const dropdownClubs = currentUser?.userData.clubs.map((c) => {
    return { label: c?.name, value: c?._id };
  });
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const selectImage = async () => {
    const selected = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 0.8,
    });

    if (!selected.canceled) {
      setImageDimensions({
        width: selected.assets[0].width,
        height: selected.assets[0].height,
      });
      setSelectedImage(selected.assets[0].uri);
    }
  };
  const browsingEvents = useSharedValue(false);
  const club = useClubData(inputClub ? inputClub : selectedClub);

  const showEvents = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: showEvents.value
        ? withTiming(300, { duration: 300 })
        : withTiming(0, { duration: 300 }),
      opacity: showEvents.value
        ? withTiming(1, { duration: 300 })
        : withTiming(0, { duration: 200 }),
      overflow: "hidden",
    };
  });

  const buttonsAnimStyle = useAnimatedStyle(() => {
    const shouldHide =
      browsingEvents.value || selectedEvent !== undefined || selectedImage;
    return {
      opacity: withTiming(shouldHide ? 0 : 1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      }),
      height: withTiming(shouldHide ? 0 : 115, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      }),
      overflow: "visible",
    };
  });
  const [height, setHeight] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => {
    const layoutHeight = event.nativeEvent.layout.height;

    if (layoutHeight !== 0 && layoutHeight !== height) {
      setHeight(layoutHeight + 20);
    }
  };

  const eventListStyle = useAnimatedStyle(() => ({
    opacity: withTiming(browsingEvents.value && !selectedEvent ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    }),
    height: withTiming(browsingEvents.value && !selectedEvent ? height : 0, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    }),
    overflow: "hidden",
    marginTop: 15,
  }));
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

  const createNewAnnouncement = useMutation(
    api.announcements.createAnnouncement
  );
  const createGlobalAnnouncement = useMutation(
    api.announcements.createGlobAnnouncement
  );
  const generateUploadUrl = useMutation(api.announcements.generateUploadUrl);
  const convex = useConvex();

  useEffect(() => {
    if (trigger > 0) {
      handleCreate();
    }
    console.log("effected in announcement");
  }, [trigger]);
  const handleCreate = async () => {
    console.log("creating announcement");
    let imageStorageId: string | undefined;

    if (selectedImage) {
      try {
        const uploadUrl = await generateUploadUrl();

        const uploadResult = await FileSystem.uploadAsync(
          uploadUrl,
          selectedImage,
          {
            httpMethod: "POST",

            mimeType: "image/jpeg",
          }
        );

        if (uploadResult.status !== 200) throw new Error("upload failed!");

        const { storageId } = JSON.parse(uploadResult.body);
        imageStorageId = storageId;
        const imageUrl = await convex.query(api.announcements.getImageUrl, {
          storageId,
        });
        console.log("Uploaded image storageId:", imageStorageId);
      } catch (error) {
        console.log("error sharing post!");
      }
    }
    const clubId = inputClub ?? selectedClub;

    const datePosted = String(dayjs());
    const image = imageStorageId;
    const event = selectedEvent?._id;
    if (inputClub || selectedClub || !local) {
      if (local) {
        console.log("create a 1");
        await createNewAnnouncement({
          clubId: (selectedClub ?? inputClub)!,
          message: AnnMessage,
          datePosted: datePosted,
          image: image,
          event: event,
        });
      } else {
        console.log("create a 2");
        await createGlobalAnnouncement({
          clubId: (selectedClub ?? inputClub)!,
          message: AnnMessage,
          datePosted: datePosted,
          image: image,
          event: event,
        });
      }
    }
    back();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={Platform.OS === "web" ? undefined : Keyboard.dismiss}
      style={{ flex: 1 }}
    >
      <View
        style={{
          paddingHorizontal: 5,
          paddingVertical: 5,
        }}
      >
        <View
          style={{ position: "absolute", opacity: 0, zIndex: -1 }}
          onLayout={onLayout}
        >
          <EventListMap
            events={
              events
                ? events.filter((e): e is Doc<"events"> => e !== null)
                : undefined
            }
            inClub={true}
            onPress={handleEventAdd}
            inCreation={false}
          />
        </View>
        <View style={[styles.header]}>
          <Text style={[styles.modalTitle]}>Create an Announcement</Text>
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
        <View style={{ paddingTop: 10 }}>
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
                onFocus={() => {}}
                onBlur={() => {}}
                onChange={(item) => {
                  setSelectedClub(item.value);
                }}
              />
            )}
          </View>
          <LargeStylizedInput
            value={AnnMessage}
            onChangeText={setMessage}
            placeholder="Tap here to edit text..."
            dark={true}
          />
        </View>
        <Animated.View
          style={[
            { alignItems: "flex-start", marginVertical: 10 },
            buttonsAnimStyle,
          ]}
        >
          {!selectedImage && (
            <>
              <TouchableOpacity onPress={selectImage}>
                <View
                  style={{
                    backgroundColor: COLORS.surfaceAlternate,
                    alignItems: "center",
                    justifyContent: "flex-start",
                    borderRadius: 55,
                    marginTop: 20,
                    marginLeft: 10,
                    flexDirection: "row",
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                  }}
                >
                  <Ionicons
                    name="image-outline"
                    color={"#fff"}
                    size={35}
                    style={{ marginRight: -10 }}
                  />
                  <Text style={styles.addText}>Add an Image</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => (browsingEvents.value = true)}
                style={{ marginBottom: 20 }}
              >
                <View
                  style={{
                    backgroundColor: COLORS.surfaceAlternate,
                    alignItems: "center",
                    justifyContent: "flex-start",
                    borderRadius: 55,
                    marginTop: 20,
                    marginLeft: 10,
                    flexDirection: "row",
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                  }}
                >
                  <Ionicons
                    name="calendar-outline"
                    color={"#fff"}
                    size={35}
                    style={{ marginRight: -10 }}
                  />
                  <Text style={styles.addText}>Attach an Event</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        <View style={{ alignItems: "center" }}>
          {selectedImage && imageDimensions && (
            <View style={{ position: "relative" }}>
              <Image
                source={selectedImage}
                contentFit="scale-down"
                transition={200}
                style={{
                  width: 200,
                  aspectRatio: imageDimensions?.width / imageDimensions?.height,
                  borderRadius: 20,
                  marginTop: 15,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  backgroundColor: COLORS.textMuted,
                  alignItems: "center",
                  padding: 4,
                  borderRadius: 20,
                  gap: 6,
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => {
                    setSelectedImage("");
                  }}
                >
                  <Ionicons name="close" color={COLORS.background} size={20} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <Animated.View style={eventListStyle}>
          <TouchableOpacity
            onPress={() => {
              browsingEvents.value = false;
            }}
            style={{ alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "InterRegular",
                color: COLORS.textSecondary,
                textAlign: "center",
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <EventListMap
            events={club?.eventList?.filter(
              (e): e is Doc<"events"> => e !== null
            )}
            inClub={true}
            onPress={handleEventAdd}
            inCreation={false}
          />
        </Animated.View>

        {selectedEvent && (
          <View style={{ justifyContent: "center", marginTop: -20 }}>
            <EventCard
              event={selectedEvent}
              onEvent={true}
              inAnnouncement={true}
              inClub={true}
              onPress={() => {
                setSelectedEvent(undefined);
                browsingEvents.value = false;
              }}
            />
          </View>
        )}
        {/*inputClub && <GradientButton onPress={handleCreate} title="Create" />*/}
        <View style={{ paddingHorizontal: 50, marginBottom: 40 }}>
          <SizeGradientButton
            onPress={handleCreate}
            title="Create"
            width={30}
            height={7}
            horizontalPadding={20}
            restricted={!inputClub || inputClub === undefined}
          />
        </View>
        <View style={{ marginVertical: !inputClub ? 80 : 0 }} />
      </View>
    </TouchableWithoutFeedback>
  );
}
