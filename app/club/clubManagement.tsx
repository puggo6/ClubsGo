import Announcement from "@/components/announcement";
import Calendar from "@/components/calendar";
import ClubFAB from "@/components/clubFAB";
import ClubLogo from "@/components/clubLogo";

import CreateAnnouncement from "@/components/createAnnouncement";
import CreateEvent, { EditEvent } from "@/components/createEvent";
import EventCard from "@/components/eventCard";
import EventGroup from "@/components/eventGroup";
import EventListView from "@/components/eventListView";
import GradientButton from "@/components/gradientButton";
import LeadershipScreen from "@/components/leadershipScreen";
import MemberCard from "@/components/memberCard";
import SettingsButton from "@/components/settingsButton";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useClubData } from "@/hooks/useClubData";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/clubManagement.styles";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import dayjs, { Dayjs } from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  SectionList,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SceneMap, TabView } from "react-native-tab-view";
import { Doc, Id } from "../../convex/_generated/dataModel";

export default function clubManagement() {
  const leaveClub = useMutation(api.users.leaveClub);
  const handleLeave = (clubId: Id<"clubs">) => {
    console.log("pressed leave");
    leaveClub({ clubId }).catch(() => {});
    router.push("/(tabs)");
  };
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const insets = useSafeAreaInsets();
  const currentDate = dayjs();
  const currentUser = useUserData();
  const currentDateString = String(dayjs());
  const screenWidth = Dimensions.get("window").width;
  const { clubId, tabIndex } = useLocalSearchParams();
  const club = useQuery(
    api.clubs.getClubData,
    clubId
      ? {
          clubId: clubId as Id<"clubs">,
        }
      : "skip"
  );
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(false);
  useEffect(() => {
    if (currentUser?.userData._id && club?.advisors) {
      setIsAdmin(club.advisors.includes(currentUser.userData._id));
    }
  }, [currentUser?.userData._id, club?.advisors]);
  const approveMember = useMutation(api.clubs.approveMember);
  const handleApprove = (clubObj: Id<"clubs">, user: Id<"users">) => {
    const club = clubObj;
    approveMember({
      clubId: club,
      userId: user,
      dateJoined: currentDateString,
    });
  };
  const eventList = club?.eventList;
  const shortenedAnnouncements =
    club?.announcementList && club.announcementList?.length > 5
      ? club.announcementList?.slice(0, 5)
      : club?.announcementList;
  const eventIds = eventList
    ? eventList
        .filter((event): event is NonNullable<typeof event> => event != null)
        .map((event) => event._id)
    : [];

  const eventDaySet = new Set(
    eventList
      ? eventList.map((event) => dayjs(event?.dateNumber).format("YYYY-MM-DD"))
      : []
  );
  const router = useRouter();

  const tagA = club?.tags[0];
  const tagB = club?.tags[1];
  const tagC = club?.tags[2];

  const numMembers = club?.members.length;
  const nextMeeting = club?.nextMeeting ?? "-";
  const isPublic = club?.clubPublic;
  const isRestricted = club?.restricted;

  const [clubInfo, setClubInfo] = useState({
    name: club?.name,
    description: club?.description,
  });

  const clubList = club ? [...club.members] : [];

  const [createExpanded, setCreateExpanded] = useState(false);
  const toggleExpanded = () => {
    setCreateExpanded(!createExpanded);
  };
  const [modalVisable, setModalVisable] = useState(false);
  const [eventSelected, setEventSelected] = useState(true);
  const [bottomSheetType, setBottomSheetType] = useState(0); // 0=Event, 1 = Announcement, 2 = editEvent, 3 = editAnnouncement, 4 = userInfo, 5 = leadership roles, 6 = announcements
  const [editEvent, setEditEvent] = useState<Id<"events"> | undefined>(
    undefined
  );
  const [eventIcon] = useState(new Animated.Value(40));
  const [announcementIcon] = useState(new Animated.Value(40));

  const [status, setStatus] = useState(false);

  let restrictedStatus = "Open";
  if (isRestricted) restrictedStatus = "Restricted";

  let publicColor = String(COLORS.privateRed);
  if (isPublic) publicColor = COLORS.publicGreen;

  let restrictedColor = String(COLORS.restricted);
  if (!isRestricted) restrictedColor = COLORS.open;

  useEffect(() => {
    if (isPublic) publicColor = COLORS.publicGreen;
    else publicColor = COLORS.privateRed;
  }, [status]);

  const [createScreenUp, setCreateScreenUp] = useState(false);
  const toggleCreateScreen = () => {
    setCreateScreenUp(!createScreenUp);
    console.log("createScreen ", createScreenUp);
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisable, setMenuVisible] = useState(false);
  const menuVisableMemo = useMemo(() => {
    return menuVisable;
  }, [menuVisable]);
  const toggleMenu = () => {
    if (menuOpen) {
      // Close menu
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        setMenuVisible(false); // hide after animation
        setMenuOpen(false);
      });
    } else {
      setMenuVisible(true); // show before opening
      setMenuOpen(true);
      requestAnimationFrame(() => {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      });
    }
  };
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(Number(tabIndex) ?? 0);
  const [routes] = useState([
    { key: "info", title: "Info" },
    { key: "members", title: "Members" },
    { key: "events", title: "Events" },
    { key: "announcements", title: "Announcements" },
    { key: "settings", title: "Settings" },
  ]);

  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) setPressedDay(undefined);
    console.log("handleSheetChanges", index);
  }, []);

  const openSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);
  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);
  const snapPoints = useMemo(() => ["50%"], []);

  const inEventTab = Boolean(routes[index].key === "events");

  const inInfoTab = Boolean(routes[index].key === "info");

  const clubEventList = club?.eventList;

  const [selectedDay, setSelectedDay] = useState(dayjs());

  const selectedEvents = club?.eventList.filter((event) =>
    dayjs(event?.dateNumber).isSame(selectedDay, "day")
  );

  const events = (useClubData(club?._id)?.eventList ?? []).filter(
    (e): e is Doc<"events"> => !!e && !!e.startTime
  );

  const sortedEvents = [...events].sort((a, b) => {
    if (!a.startTime || !b.startTime) return 0;
    const timeA = dayjs(a.startTime, "HH:mm");
    const timeB = dayjs(b.startTime, "HH:mm");
    return timeA.isAfter(timeB) ? 1 : -1;
  });

  const sortedMeetings = sortedEvents.filter((e) => e.eventType === "Meeting");
  const sortedNonMeetings = sortedEvents.filter(
    (e) => e.eventType !== "Meeting"
  );

  const [pressedDay, setPressedDay] = useState<Dayjs | undefined>(undefined);
  const [onCalendar, setOnCalendar] = useState(true);
  const [currentCalDate, setCurrentDate] = useState(dayjs());
  const lastEvent = events[events.length - 1];

  const HEADER_EXPANDED_HEIGHT = 220;

  const headerTranslateY = useRef(new Animated.Value(0)).current;

  const contentTranslateY = useRef(new Animated.Value(0)).current;
  const circleTranslateY = useRef(new Animated.Value(0)).current;
  const translateIconY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerTranslateY, {
        toValue: index === 0 ? 0 : -220,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: index === 0 ? 0 : -140,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(circleTranslateY, {
        toValue: index === 0 ? 0 : -150,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateIconY, {
        toValue: index === 0 ? 0 : -160,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);
  const infoTab = () => (
    <ScrollView style={{ marginTop: 20 }}>
      <Text
        style={{
          fontFamily: "InterMedium",
          fontSize: 34,
          color: COLORS.textPrimary,
          textAlign: "center",
          marginTop: 15,
        }}
      >
        Club Dashboard
      </Text>
      <View
        style={{
          height: 2,
          width: "90%",
          backgroundColor: COLORS.surfaceLight,
          marginVertical: 6,
          alignSelf: "center",
        }}
      />
      <View>
        <Text
          style={{
            fontFamily: "OpenSansSemiBold",
            fontSize: 24,
            color: COLORS.textSecondary,
            textAlign: "center",
          }}
        >
          Next Meeting:
        </Text>
        {sortedMeetings[0] && (
          <EventGroup events={[sortedMeetings[0]]} inClub={true} />
        )}
        <Text
          style={{
            fontFamily: "OpenSansSemiBold",
            fontSize: 24,
            color: COLORS.textSecondary,
            textAlign: "center",
          }}
        >
          Next Event:
        </Text>
        {sortedNonMeetings[0] && (
          <EventGroup events={[sortedNonMeetings[0]]} inClub={true} />
        )}
        <Text
          style={{
            fontFamily: "OpenSansSemiBold",
            fontSize: 24,
            color: COLORS.textSecondary,
            textAlign: "center",
          }}
        >
          Recent Activity:
        </Text>
        {shortenedAnnouncements &&
          shortenedAnnouncements.map((item) => (
            <Announcement
              description={item?.message ?? ""}
              dateCreated={item?.datePosted ?? ""}
              eventId={item?.event}
              key={item?._id}
            />
          ))}
      </View>
    </ScrollView>
  );

  const MEMBERDATA = [
    {
      title: "Staff",
      data: clubList
        .filter((u) => u?.user?._id && club?.advisors?.includes(u?.user._id))
        .map((m) => m.user),
      show: true,
    },
    {
      title: "Members",
      data: clubList
        .filter(
          (u) =>
            u &&
            !club?.pendingMembers?.includes(u.user) &&
            !club?.advisors?.includes(u?.userId)
        )
        .map((m) => m.user),
      show: true,
    },
    {
      title: "Pending Members",
      data: club?.pendingMembers,
      show: isAdmin,
    },
    {
      title: "Pending Staff",
      data: club?.pendingAdvisors,
      show: isAdmin,
    },
  ];

  const FILTEREDDATA = MEMBERDATA.filter((section) => section.show);
  const VISIBLE_SECTIONS = FILTEREDDATA.map(({ title, data }) => ({
    title,
    data: data ?? [],
  }));

  const MembersTab = () => (
    <View style={styles.memberListBackdrop}>
      {club?._id && (
        <SectionList
          sections={VISIBLE_SECTIONS}
          keyExtractor={(item) => item?._id ?? Math.random().toString()}
          contentContainerStyle={{ padding: 16 }}
          ListFooterComponent={<View />}
          ListFooterComponentStyle={{ height: 50 }}
          renderItem={({ item }) => {
            const userData = clubList.find((u) => u.userId === item?._id);

            return (
              <MemberCard
                isMember={!club.pendingMembers.includes(item)}
                userPFP={item?.profilePicture}
                name={item?.fullName ?? ""}
                dateJoined={
                  userData?.dateJoined
                    ? dayjs(userData?.dateJoined).format("MMMM DD")
                    : "N/A"
                }
                onPress={
                  item?._id
                    ? () => {
                        handleApprove(club?._id, item?._id);
                      }
                    : () => {}
                }
                approvalCard={
                  club?.pendingMembers
                    .map((u) => {
                      return u?._id;
                    })
                    .includes(item?._id) ||
                  club?.pendingAdvisors
                    .map((u) => {
                      return u?._id;
                    })
                    .includes(item?._id)
                }
              />
            );
          }}
          renderSectionHeader={({ section: { title } }) => (
            <>
              <View style={styles.divSpace}>
                <Text style={styles.divTitle}>{title}</Text>
              </View>
              <View
                style={{
                  alignSelf: "center",
                  height: 2,
                  backgroundColor: COLORS.surfaceLight,
                  marginBottom: 10,
                  paddingHorizontal: 30,
                  width: "90%",
                }}
              />
            </>
          )}
          ItemSeparatorComponent={({}) => (
            <View
              style={{
                alignSelf: "center",
                height: 2,
                backgroundColor: COLORS.surfaceLight,
                marginVertical: 10,
                paddingHorizontal: 30,
                width: "90%",
              }}
            />
          )}
        />
      )}
    </View>
  );

  const handleEditEvent = (event: Doc<"events">) => {
    setBottomSheetType(2);
    setEditEvent(event._id);
    openSheet();
  };
  const handleEditRoles = () => {
    setBottomSheetType(5);

    openSheet();
  };
  const EventsTab = () => (
    <View>
      {onCalendar && (
        <View>
          <Calendar
            admin={true}
            eventList={eventDaySet}
            onCellPress={(day) => {
              if (pressedDay?.isSame(day, "day")) {
                bottomSheetRef.current ? bottomSheetRef.current.close() : null;
                setPressedDay(undefined);
              } else setPressedDay(day);
              setSelectedDay(day);
              setBottomSheetType(6);
              openSheet();
            }}
            pressedDay={pressedDay}
            currentInputDate={currentCalDate}
            onMonthChange={(newDate) => setCurrentDate(newDate)}
          />
        </View>
      )}
      {!onCalendar && (
        <View>
          <EventListView
            events={
              eventList
                ? eventList.filter((e): e is Doc<"events"> => e !== null)
                : undefined
            }
            inClub={true}
            onPress={handleEditEvent}
          />
          {!events ||
            ((events.length == 0 ||
              dayjs(lastEvent.dateNumber).isBefore(currentDate)) && (
              <Text style={styles.infoTitle}>No Upcoming Events!</Text>
            ))}
        </View>
      )}
    </View>
  );

  const fullAnnouncements = club?.announcementList
    .filter((a): a is Doc<"announcements"> => a !== null)
    .map((announcement) => {
      const matchingEvent = club.eventList.find(
        (event) => event?._id === announcement.event
      );

      return {
        ...announcement,
        eventData: matchingEvent ?? undefined,
      };
    });
  const AnnouncementsTab = () => (
    <View>
      <FlatList
        data={fullAnnouncements}
        keyExtractor={(item) => item?._id.toString() ?? index.toString()}
        initialNumToRender={5}
        windowSize={5}
        maxToRenderPerBatch={5}
        renderItem={({ item }) =>
          item ? (
            <Announcement
              description={item.message}
              image={item.image}
              dateCreated={item.datePosted}
              eventId={item.eventData?._id}
            />
          ) : null
        }
      />

      {!club?.announcementList ||
        (club.announcementList.length < 1 && (
          <View>
            <Text style={{ color: COLORS.textPrimary, fontSize: 24 }}>
              No announcements to show!
            </Text>
          </View>
        ))}
    </View>
  );

  const SettingsTab = () => (
    <ScrollView>
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Club Settings</Text>
        <View
          style={[
            styles.divider,
            {
              backgroundColor: COLORS.textSecondary,
              width: 340,
              alignSelf: "center",
            },
          ]}
        />

        <Text style={styles.infoText}>
          Status:{" "}
          <Text
            style={{ color: status ? COLORS.publicGreen : COLORS.privateRed }}
          >
            {status ? "Public" : "Private"}
          </Text>
          ,{" "}
          <Text style={{ color: restrictedColor }}>
            {restrictedStatus +
              (club?.restricted
                ? " - " +
                  (club?.restrictedType === 0
                    ? "Application"
                    : club?.restrictedType === 1
                      ? "Tryout"
                      : "Prerequisite")
                : "")}
          </Text>
        </Text>

        <Pressable
          onPress={
            status
              ? () => {
                  setStatus(false);
                }
              : () => {
                  setStatus(true);
                }
          }
        >
          <View style={{ marginLeft: 20 }}>
            <View style={styles.restrictedContainer}>
              <View style={styles.lockContainer}>
                <MaterialIcons
                  name={status ? "public" : "public-off"}
                  style={{
                    color: !status ? COLORS.privateRed : COLORS.publicGreen,
                  }}
                  size={28}
                />
              </View>

              <Text style={styles.restrictedText}>
                {status
                  ? "The club can be viewed and joined by all users"
                  : "The club can not be viewed or joined by anyone"}
              </Text>
            </View>
          </View>
        </Pressable>

        <SettingsButton
          title="View Info Page"
          onPress={() => {
            router.push({
              pathname: "/club/clubInfo",
              params: { clubId: club?._id },
            });
          }}
          screenWidth={screenWidth}
        >
          <Feather name="info" size={32} color={COLORS.textSecondary} />
        </SettingsButton>
        <SettingsButton
          title="Manage Leadership Roles"
          onPress={handleEditRoles}
          screenWidth={screenWidth}
        >
          <Ionicons
            name="podium-outline"
            size={32}
            color={COLORS.textSecondary}
          />
        </SettingsButton>
        <View style={{ justifyContent: "flex-start" }}>
          <GradientButton
            onPress={
              club?._id &&
              (currentUser?.userData.role === "student" ||
                (isAdmin && club?.advisors && club?.advisors?.length > 1))
                ? () => handleLeave(club?._id)
                : () => {
                    console.log("Leave Failed");
                  }
            }
            title="Leave Club"
            restricted={
              (!club?.advisors || club?.advisors?.length <= 1) && isAdmin
            }
          />
          {(!club?.advisors || club?.advisors?.length <= 1) && isAdmin && (
            <Text
              style={[styles.infoText, { textAlign: "center", marginTop: -60 }]}
            >
              You cannot leave a club with no other advisors.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderScene = SceneMap({
    info: infoTab,
    members: MembersTab,
    events: EventsTab,
    settings: SettingsTab,
    announcements: AnnouncementsTab,
  });

  const CustomBackground = ({ style }: BottomSheetBackgroundProps) => (
    <View
      style={[
        style,
        {
          backgroundColor: COLORS.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
      ]}
    />
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [clubImage, setClubImage] = useState("");
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
      setClubImage(selected.assets[0].uri);
    }
  };
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {menuVisableMemo && (
        <>
          <Pressable style={styles.menuOverlay} onPress={toggleMenu} />

          <Animated.View
            style={[
              styles.menuPanel,
              {
                left: slideAnim,
                backgroundColor: !menuOpen
                  ? "transparent"
                  : styles.menuPanel.backgroundColor,
              },
            ]}
          >
            <View style={styles.menuContainer}>
              <View style={styles.header}>
                <Text
                  style={styles.headerTitle}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {club ? club.name : ""}
                </Text>
                <Text style={styles.headerSubtitle}>Club Management Page</Text>
              </View>
              <LinearGradient
                colors={["#f64f59", "#c471ed", "#12c2e9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBar}
              />
              <Pressable
                onPress={() => {
                  setIndex(0); // Members
                  toggleMenu();
                }}
                style={styles.menuItemPressable}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={30}
                  color={COLORS.textPrimary}
                  style={{ marginRight: 8, top: 1 }}
                />
                <Text style={[styles.menuItem]}>Info</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIndex(1); // Members
                  toggleMenu();
                }}
                style={styles.menuItemPressable}
              >
                <Ionicons
                  name="people-outline"
                  size={30}
                  color={COLORS.textPrimary}
                  style={{ marginRight: 8, top: 1 }}
                />
                <Text style={[styles.menuItem]}>Members</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIndex(2); // Members
                  toggleMenu();
                }}
                style={styles.menuItemPressable}
              >
                <Ionicons
                  name="calendar-outline"
                  size={30}
                  color={COLORS.textPrimary}
                  style={{ marginRight: 8, top: 1 }}
                />
                <Text style={[styles.menuItem]}>Events</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIndex(3); // Members
                  toggleMenu();
                }}
                style={styles.menuItemPressable}
              >
                <Ionicons
                  name="megaphone-outline"
                  size={30}
                  color={COLORS.textPrimary}
                  style={{ marginRight: 8, top: 1 }}
                />
                <Text style={[styles.menuItem]}>Announcements</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIndex(4); // settings
                  toggleMenu();
                }}
                style={styles.menuItemPressable}
              >
                <Ionicons
                  name="options-outline"
                  size={30}
                  color={COLORS.textPrimary}
                  style={{ marginRight: 8, top: 1 }}
                />
                <Text style={[styles.menuItem]}>Settings</Text>
              </Pressable>
              <View style={styles.menuItemPressable}>
                <Ionicons
                  name="home-outline"
                  size={30}
                  color={COLORS.textPrimary}
                  style={{ marginRight: 8, top: 1 }}
                />
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.menuItem}>Home</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </>
      )}
      {/* animated club header for info tab */}
      <Animated.View
        style={[
          styles.infoHeader,
          {
            height: HEADER_EXPANDED_HEIGHT,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <View
          style={{
            justifyContent: "center",
            position: "absolute",
            height: "100%",
            width: "100%",
            alignItems: "center",
          }}
        >
          <Animated.Text
            style={{
              fontSize: 48,
              color: COLORS.textPrimary,
              fontFamily: "PoppinsBold",
              textAlign: "center",
              top: 110,
              position: "absolute",
              transform: [{ translateY: circleTranslateY }],
              width: "95%",
            }}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {club?.name}
          </Animated.Text>
        </View>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ translateY: circleTranslateY }],
              top: 50,
            },
          ]}
        >
          {club && (
            <>
              <ClubLogo
                clubN={club.name}
                image={clubImage ? clubImage : undefined}
              />
              <Animated.View
                style={{
                  position: "absolute",
                  top: 120,
                  right: 5,
                  backgroundColor: COLORS.textMuted,
                  alignItems: "center",
                  padding: 4,
                  borderRadius: 20,
                  gap: 6,
                  transform: [{ translateY: translateIconY }],
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => {
                    selectImage();
                  }}
                >
                  <Ionicons name="image" color={COLORS.background} size={20} />
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
        </Animated.View>
      </Animated.View>
      {/* Icon to open hanmburger menu */}

      <Animated.View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          paddingHorizontal: 10,
          paddingTop: 0,
          transform: [{ translateY: contentTranslateY }],
        }}
      >
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons name="menu" color={COLORS.textPrimary} size={40} />
        </TouchableOpacity>
        {inEventTab && (
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
        )}
      </Animated.View>
      <Animated.View
        style={{ flex: 1, transform: [{ translateY: contentTranslateY }] }}
      >
        <TabView
          swipeEnabled={false}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={() => null}
        />
      </Animated.View>
      {/* Modal for user information in the members tab*/}
      {
        <Modal
          visible={modalVisable}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisable(false)}
        >
          <TouchableWithoutFeedback
            onPressIn={Platform.OS === "web" ? undefined : Keyboard.dismiss}
            style={{ flex: 1 }}
          >
            <View style={styles.overlay}>
              <View style={styles.modalContainer}>
                <View
                  style={{
                    alignSelf: "flex-start",
                    alignItems: "flex-start",
                    padding: 20,
                  }}
                >
                  <Pressable onPress={() => setModalVisable(false)}>
                    <AntDesign
                      name="arrow-left"
                      size={24}
                      color={COLORS.textPrimary}
                    />
                  </Pressable>
                </View>
                <View
                  style={{ marginBottom: 30, width: 340, height: 250 }}
                ></View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      }
      {
        /* FAB for announcement and event creation */
        isAdmin && (
          <ClubFAB
            eventPress={() => {
              setBottomSheetType(0);
              openSheet();
            }}
            announcementPress={() => {
              setBottomSheetType(1);
              openSheet();
            }}
          />
        )
      }
      <TouchableOpacity onPress={() => router.back()} style={styles.leaveText}>
        <Text
          style={{
            fontFamily: "InterRegular",
            fontSize: 20,
            color: COLORS.textSecondary,
            alignSelf: "flex-start",
            textAlign: "left",
          }}
        >
          Back to home
        </Text>
      </TouchableOpacity>
      {/* 
        A bottom sheet which appears when a date is pressed on the calendar, showing all events for that day.
        This is also where the user can create and edit events and announcements.
      */}
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: COLORS.textSecondary }}
        keyboardBehavior="interactive"
        enableDynamicSizing
        style={{ backgroundColor: COLORS.surface }}
        backgroundStyle={{
          backgroundColor: COLORS.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        backgroundComponent={CustomBackground}
        onClose={() => {
          setPressedDay(undefined);
        }}
      >
        <BottomSheetScrollView
          style={{
            flex: 1,
            padding: 0,

            backgroundColor: COLORS.surface,
          }}
        >
          {bottomSheetType === 6 && (
            <View>
              <View style={{ alignItems: "flex-start" }}>
                {selectedEvents &&
                  selectedEvents.length > 0 &&
                  selectedEvents?.map((event) => (
                    <EventCard
                      key={event?._id}
                      event={event ? event : undefined}
                      inClub={true}
                      onEvent={true}
                      onPress={event ? () => handleEditEvent(event) : () => {}}
                    />
                  ))}
              </View>
              {selectedEvents && selectedEvents.length < 1 && (
                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <Text style={styles.placeHolder}>No Events to Show</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => {
                  bottomSheetRef.current
                    ? bottomSheetRef.current.close()
                    : null;
                  setOnCalendar(!onCalendar);
                }}
                style={{ alignSelf: "center" }}
              >
                <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
                  View All Club Events
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableWithoutFeedback
            onPressIn={Platform.OS === "web" ? undefined : Keyboard.dismiss}
            style={{ flex: 1 }}
          >
            <View style={{ flex: 1, alignItems: "center" }}>
              <View style={[styles.modalContainer, { width: "90%" }]}>
                {club && bottomSheetType === 0 ? (
                  <CreateEvent
                    inputClub={clubId as Id<"clubs">}
                    back={toggleCreateScreen}
                  />
                ) : bottomSheetType === 1 ? (
                  <CreateAnnouncement
                    inputClub={clubId as Id<"clubs">}
                    trigger={0}
                    back={toggleCreateScreen}
                  />
                ) : bottomSheetType === 2 && editEvent ? (
                  <EditEvent inputEvent={editEvent} back={toggleCreateScreen} />
                ) : bottomSheetType === 5 && club?._id ? (
                  <LeadershipScreen
                    previousRoles={club?.leadershipRoles}
                    club={club?._id}
                    close={closeSheet}
                  />
                ) : (
                  <></>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

/*
{club?.eventList[0] && (
            <View>
              <EventCard
                event={club?.eventList[0]}
                inClub={true}
                onEvent={true}
              />

              <EventCard
                event={club?.eventList[0]}
                inClub={true}
                onEvent={true}
              />
            </View>
          )}
*/
