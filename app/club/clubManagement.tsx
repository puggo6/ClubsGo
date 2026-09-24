import Announcement from "@/components/announcement";
import Calendar from "@/components/calendar";
import ClubFAB from "@/components/clubFAB";

import AssignAdvisorsScreen from "@/components/assignAdvisorsScreen";
import AssignOfficersScreen, {
  Member,
} from "@/components/assignOfficersScreen";
import CreateSceenComp from "@/components/create";
import CreateAnnouncement from "@/components/createAnnouncement";
import CreateEvent, { EditEvent } from "@/components/createEvent";
import DeletionModal from "@/components/deletionModal";
import EventCard from "@/components/eventCard";
import EventGroup from "@/components/eventGroup";
import EventListView from "@/components/eventListView";
import GradientButton, { ButtonPair } from "@/components/gradientButton";
import LeadershipScreen from "@/components/leadershipScreen";
import MemberCard from "@/components/memberCard";
import SchoolSetting from "@/components/schoolSetting";
import SettingsButton from "@/components/settingsButton";
import UserInfoModal from "@/components/userInfo";
import WebCalendar from "@/components/webCalendar";
import { ManagementModal } from "@/components/webCreateModal";
import isWeb from "@/constants/isWeb";
import { isHeadAdmin, isStudent } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/clubManagement.styles";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import dayjs, { Dayjs } from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SceneMap, TabView } from "react-native-tab-view";
import Toast from "react-native-toast-message";
import { Doc, Id } from "../../convex/_generated/dataModel";

export default function clubManagement() {
  const leaveClub = useMutation(api.users.leaveClub);
  const deleteClub = useMutation(api.clubs.deleteClub);
  const joinClub = useMutation(api.users.joinClub);

  const [startedDelete, setStartedDelete] = useState(false);

  const cancelEvent = useMutation(api.events.setEventCancelled);

  const handleLeave = (clubId: Id<"clubs">) => {
    leaveClub({ clubId }).catch(() => {});
    router.push("/(tabs)");
  };
  const handleDelete = (clubId: Id<"clubs">) => {
    setStartedDelete(true);
    deleteClub({ clubId }).catch(() => {});
    router.push("/(tabs)");
  };
  const handleJoin = (clubId: Id<"clubs">) => {
    joinClub({ clubId, currentDate: String(dayjs()) }).catch(() => {});
    router.push("/(tabs)");
  };
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const insets = useSafeAreaInsets();
  const currentDate = dayjs();
  const currentUser = useUserData();
  const currentDateString = String(dayjs());
  const screenWidth = Dimensions.get("window").width;
  const { clubId, tabIndex } = useLocalSearchParams();

  const clubQueryArgs = useMemo(() => {
    if (!clubId) return "skip";

    return {
      clubId: clubId as Id<"clubs">,
      deleting: startedDelete,
    };
  }, [clubId, startedDelete]);
  const club = useQuery(
    api.clubs.getClubData,
    clubQueryArgs === "skip"
      ? "skip"
      : { ...clubQueryArgs, includeTryouts: false },
  );
  const notInClub =
    isHeadAdmin(currentUser?.userData.role) &&
    !club?.advisors?.includes(currentUser.userData._id);
  const [isAdmin, setIsAdmin] = useState<boolean>(
    currentUser?.userData._id
      ? (club?.advisors ?? []).includes(currentUser?.userData._id)
      : false,
  );
  useEffect(() => {
    if (currentUser?.userData._id && club?.advisors) {
      setIsAdmin(club?.advisors.includes(currentUser?.userData._id));
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

  const validAnnouncements = useMemo(() => {
    return (club?.announcementList ?? []).filter(
      (announcement): announcement is Doc<"announcements"> =>
        announcement !== null,
    );
  }, [club?.announcementList]);

  const shortenedAnnouncements = useMemo(() => {
    if (validAnnouncements.length > 5) {
      return validAnnouncements.slice(0, 5);
    }
    return validAnnouncements;
  }, [validAnnouncements]);
  const eventDaySet = new Set(
    eventList
      ? eventList.map((event) => dayjs(event?.dateNumber).format("YYYY-MM-DD"))
      : [],
  );

  const WebEventPanel = () => (
    <View style={webStyles.eventPanel}>
      <Text style={webStyles.panelTitle}>
        {pressedDay ? pressedDay.format("dddd, MMMM D") : "Select a Day"}
      </Text>
      <View style={webStyles.panelDivider} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {pressedDay ? (
          (selectedEvents?.length ?? 0 > 0) ? (
            selectedEvents?.map((event) => (
              <EventCard
                key={event?._id}
                event={event ?? undefined}
                inClub={false}
                onEvent={true}
                onPress={() => {}}
                onLongPress={() => {}}
                global={
                  event?.global &&
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

  const setPinnedStatus = useMutation(api.announcements.setPinnedStatus);
  const deleteAnnouncement = useMutation(api.announcements.deleteAnnouncement);
  const deleteEvent = useMutation(api.events.deleteEvent);

  const [createExpanded, setCreateExpanded] = useState(false);
  const toggleExpanded = () => {
    setCreateExpanded(!createExpanded);
  };
  const [modalVisable, setModalVisable] = useState(false);
  const [eventSelected, setEventSelected] = useState(true);
  const [bottomSheetType, setBottomSheetType] = useState<number | undefined>(
    undefined,
  ); // 0=Event, 1 = Announcement, 2 = editEvent, 3 = editAnnouncement, 4 = userInfo, 5 = leadership roles, 6 = announcements
  const [editEvent, setEditEvent] = useState<Id<"events"> | undefined>(
    undefined,
  );
  const [eventIcon] = useState(new Animated.Value(40));
  const [announcementIcon] = useState(new Animated.Value(40));

  const [status, setStatus] = useState(club?.clubPublic);
  const toggleClubStatus = useMutation(api.clubs.setClubStatus);
  const handleConfigurationsChange = useMutation(
    api.clubs.setClubConfigurations,
  );

  const [adminsNeedApproval, setAdminsNeedApproval] = useState(
    club?.configurations?.adminsNeedApproval ?? false,
  );
  const [membersNeedApproval, setMembersNeedApproval] = useState(
    club?.configurations?.membersNeedApproval ?? false,
  );
  const handleSaveSettings = () => {
    if (!club?._id) return;
    setHasChanges(false);
    toggleClubStatus({ clubId: club?._id, set: status ?? false });
    handleConfigurationsChange({
      clubId: club?._id,
      adminsNeedApproval: adminsNeedApproval,
      membersNeedApproval: membersNeedApproval,
    });
    Toast.show({
      type: "success",
      text1: "Changes Successfully Saved",
      position: "top",
      visibilityTime: 2500,
      topOffset: 50,
    });
  };
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
  const [modalOpen, setModalOpen] = useState(false);
  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) setPressedDay(undefined);
  }, []);

  const openSheet = useCallback(
    (type?: number) => {
      const resolvedType = type ?? bottomSheetType;
      if (!isWeb() && resolvedType !== 2) {
        bottomSheetRef.current?.expand();
      } else setModalOpen(true);
    },
    [bottomSheetType],
  );
  const closeSheet = useCallback(() => {
    if (!isWeb() && bottomSheetType === 2) {
      bottomSheetRef.current?.close();
    } else setModalOpen(false);
  }, []);
  const snapPoints = useMemo(() => ["50%"], []);

  const inEventTab = Boolean(routes[index].key === "events");

  const inInfoTab = Boolean(routes[index].key === "info");

  const clubEventList = club?.eventList;

  const [selectedDay, setSelectedDay] = useState(dayjs());

  const selectedEvents = club?.eventList.filter((event) =>
    dayjs(event?.dateNumber).isSame(selectedDay, "day"),
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
  const routeDocToManager = (event: Doc<"events"> | undefined) => {
    if (event && event.clubId) {
      router.push({
        pathname: "/club/clubManagement",
        params: { clubId: event?.clubId.toString(), tabIndex: 0 },
      });
    }
  };

  let events = (club?.eventList ?? []).filter((e): e is Doc<"events"> => !!e);
  useEffect(() => {
    events = (club?.eventList ?? []).filter((e): e is Doc<"events"> => !!e);
  }, [club, club?.eventList]);
  const sortedEvents = [...events].sort((a, b) => {
    if (!a.startTime || !b.startTime) return 0;
    const timeA = dayjs(a.startTime, "HH:mm");
    const timeB = dayjs(b.startTime, "HH:mm");
    return timeA.isAfter(timeB) ? 1 : -1;
  });

  const sortedMeetings = sortedEvents
    .filter((e) => e.eventType === "Meeting")
    .filter((e) => dayjs(e.dateNumber).isAfter(dayjs()));
  const sortedNonMeetings = sortedEvents.filter(
    (e) => e.eventType !== "Meeting",
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

  const isOfficer = club?.members
    ?.filter((o) => o.role)
    .map((o) => o.user?._id)
    .includes(currentUser?.userData._id);
  const canEditClub =
    (isHeadAdmin(currentUser?.userData.role) &&
      club?.advisors?.includes(currentUser?.userData?._id)) ||
    (currentUser?.userData?._id &&
      club?.advisors?.includes(currentUser?.userData?._id)) ||
    isOfficer;
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
  const getRole = (u: Id<"users"> | undefined) => {
    return club?.members.map((m) => m.user?._id).includes(u)
      ? club.members[club.members.map((m) => m.user?._id).indexOf(u)].role
      : undefined;
  };
  const WebTopNav = () => (
    <View style={webStyles.topNav}>
      {/* club identity on the left */}
      <View style={webStyles.topNavIdentity}>
        <Text style={webStyles.topNavClubName} numberOfLines={1}>
          {club?.name}
        </Text>
      </View>

      {/* tab nav in the center */}
      <View style={webStyles.topNavTabs}>
        {[
          { label: "Info", tabIndex: 0 },
          { label: "Members", tabIndex: 1 },
          { label: "Events", tabIndex: 2 },
          { label: "Announcements", tabIndex: 3 },
          { label: "Settings", tabIndex: 4 },
        ].map((item) => (
          <Pressable
            key={item.tabIndex}
            onPress={() => setIndex(item.tabIndex)}
            // @ts-ignore
            style={[
              webStyles.topNavTab,
              index === item.tabIndex && webStyles.topNavTabActive,
            ]}
          >
            <Text
              style={[
                webStyles.topNavTabLabel,
                index === item.tabIndex && webStyles.topNavTabLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* home button on the right */}
      <Pressable
        onPress={() => router.push("/(tabs)")}
        style={webStyles.topNavHome}
        // @ts-ignore
        onMouseEnter={(e: any) => (e.currentTarget.style.opacity = "0.7")}
        onMouseLeave={(e: any) => (e.currentTarget.style.opacity = "1")}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
        <Text style={webStyles.topNavHomeLabel}>Home</Text>
      </Pressable>
    </View>
  );
  const infoTab = () => (
    <ScrollView
      style={[
        { marginTop: 20 },
        isWeb() && { width: "100%", maxWidth: 1280, alignSelf: "center" },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          {
            width: isWeb() ? "100%" : "95%",
            backgroundColor: club?.clubColor,
            borderRadius: 30,
            height: 150,
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
          },
        ]}
      >
        <Text
          style={{
            fontSize: 48,
            color: COLORS.textPrimary,
            fontFamily: "PoppinsBold",
            textAlign: "center",
          }}

          numberOfLines={1}
        >
          {club?.name}
        </Text>
      </View>

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
        {sortedMeetings[0] && (
          <>
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

            <EventGroup events={[sortedMeetings[0]]} inClub={true} />
          </>
        )}
        {sortedNonMeetings[0] && (
          <>
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

            <EventGroup events={[sortedNonMeetings[0]]} inClub={true} />
          </>
        )}
        {shortenedAnnouncements.length > 0 && (
          <>
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
                  pinned={item?.pinned}
                  isAdmin={isAdmin}
                  createdBy={item.postedBy}
                  onPin={(isPinned) => {
                    item?._id
                      ? setPinnedStatus({
                          announcementId: item?._id,
                          status: isPinned ?? false,
                        })
                      : null;
                  }}
                  onDelete={() => {
                    item
                      ? deleteAnnouncement({ announcementId: item?._id })
                      : null;
                  }}
                  userRole={getRole(item?.postedBy)}
                  creatorName={item.creatorName}
                  creatorPFP={item.creatorPFP}
                />
              ))}
          </>
        )}
      </View>
    </ScrollView>
  );

  const MEMBERDATA = [
    {
      title: "Advisors",
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
            !club?.advisors?.includes(u?.userId),
        )
        .map((m) => m.user)
        .sort((a, b) => {
          if (getRole(a?._id) === undefined) return 1;
          if (getRole(b?._id) === undefined) return -1;
          return 0;
        }),
      show: true,
    },
    {
      title: "Pending Members",
      data: club?.pendingMembers,
      show: isAdmin && (club?.pendingMembers ?? []).length > 0,
    },
    {
      title: "Pending Advisors",
      data: club?.pendingAdvisors,
      show: isAdmin && (club?.pendingAdvisors ?? []).length > 0,
    },
  ];

  const FILTEREDDATA = MEMBERDATA.filter((section) => section.show);
  const VISIBLE_SECTIONS = FILTEREDDATA.map(({ title, data }) => ({
    title,
    data: data ?? [],
  }));
  const [selectedMember, setSelectedMember] = useState<
    Doc<"users"> | undefined
  >(undefined);

  const handleUserInfo = (user: Doc<"users"> | undefined) => {
    if (!user) return;
    setSelectedMember(user);
    setModalVisable(true);
  };
  const MembersTab = () => (
    <View
      style={[
        styles.memberListBackdrop,
        isWeb() && { width: "100%", maxWidth: 1280, alignSelf: "center" },
      ]}
    >
      {club?._id && (
        <>
          <SectionList
            sections={VISIBLE_SECTIONS}
            keyExtractor={(item) => item?._id ?? Math.random().toString()}
            contentContainerStyle={{ padding: 16 }}
            ListFooterComponent={<View />}
            ListFooterComponentStyle={{ height: 50 }}
            renderItem={({ item }) => {
              const userData = clubList.find((u) => u.userId === item?._id);

              return (
                <View style={{ width: "100%" }}>
                  <TouchableOpacity
                    onPress={() => handleUserInfo(item ?? undefined)}
                  >
                    <MemberCard
                      isMember={!club?.pendingMembers.includes(item)}
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
                      role={getRole(item?._id)}
                    />
                  </TouchableOpacity>
                </View>
              );
            }}
            renderSectionHeader={({ section: { title } }) => (
              <>
                <View style={styles.divSpace}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={canEditClub ? handleAssignAdvisors : () => void {}}
                  >
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={styles.divTitle}
                    >
                      {title}
                      {title === "Advisors" && canEditClub && (
                        <>
                          <Text> - </Text>
                          <Text
                            style={{
                              color: "#1D4ED8",
                              textDecorationLine: "underline",
                            }}
                          >
                            Assign Advisors
                          </Text>
                        </>
                      )}
                    </Text>
                  </TouchableOpacity>
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
          />
        </>
      )}
    </View>
  );

  const handleDeleteEvent = (event: Doc<"events">) => {
    deleteEvent({ eventId: event._id });
  };

  const handleCancelEvent = (event: Doc<"events">) => {
    cancelEvent({
      eventId: event._id,
      isCancelled: !(event.canceled ?? false),
    });
  };
  const handleEditEvent = (event: Doc<"events">) => {
    setBottomSheetType(2);
    setEditEvent(event._id);
    openSheet(2);
  };
  const handleEditRoles = () => {
    setBottomSheetType(5);
    openSheet();
  };
  const handleAssignOfficers = () => {
    setBottomSheetType(7);
    openSheet();
  };
  const handleAssignAdvisors = () => {
    setBottomSheetType(8);
    openSheet();
  };

  const handleEditClub = () => {
    setBottomSheetType(9);
    openSheet();
  };

  const modalTitle = () => {
    switch (bottomSheetType) {
      case 0:
        return "Create Event";
      case 1:
        return "Create Announcement";
      case 2:
        return "Edit Event";
      case 5:
        return "Manage Leadership Roles";
      case 7:
        return "Assign Officers";
      case 9:
        return "Edit Club Info";
      default:
        return "";
    }
  };

  const BottomSheetComponent = () => {
    return (
      <View style={{ alignItems: "center" }}>
        <View
          style={[
            styles.modalContainer,
            { width: bottomSheetType === 9 ? "100%" : "90%" },
          ]}
        >
          {bottomSheetType === 0 ? (
            <CreateEvent inputClub={clubId as Id<"clubs">} back={closeSheet} />
          ) : bottomSheetType === 1 ? (
            <CreateAnnouncement
              inputClub={clubId as Id<"clubs">}
              inputClubEvents={club?.eventList}
              trigger={0}
              back={closeSheet}
            />
          ) : bottomSheetType === 2 && editEvent ? (
            <EditEvent inputEvent={editEvent} back={closeSheet} />
          ) : bottomSheetType === 5 && club?._id ? (
            <LeadershipScreen
              previousRoles={club?.officerRoles}
              club={club?._id}
              close={closeSheet}
            />
          ) : bottomSheetType === 7 && club?._id ? (
            <AssignOfficersScreen
              allMembers={
                club.members.filter((m) => m.user !== null) as Member[]
              }
              club={club?._id}
              clubName={club?.name}
              close={closeSheet}
              clubRoles={club.officerRoles}
            />
          ) : bottomSheetType === 8 ? (
            <AssignAdvisorsScreen
              clubMembers={club?.members.map((m) => m.userId) ?? []}
              clubId={club?._id}
            />
          ) : bottomSheetType === 9 ? (
            <CreateSceenComp
              onCreate={closeSheet}
              editing={true}
              club={club?._id}
            />
          ) : (
            <></>
          )}
        </View>
      </View>
    );
  };

  const EventsTab = () => (
    <View style={isWeb() && { height: "100%" }}>
      {isWeb() &&
        (onCalendar ? (
          <WebCalendar
            events={events ?? []}
            canEdit={canEditClub}
            inClub={true}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
            onCancel={handleCancelEvent}
          />
        ) : (
          <View style={webStyles.calendarRow}>
            <View style={webStyles.calendarContainer}>
              <Calendar
                admin={true}
                eventList={eventDaySet}
                onCellPress={handleDayPress}
                pressedDay={pressedDay}
                currentInputDate={currentCalDate}
                onMonthChange={(newDate) => setCurrentDate(newDate)}
              />
            </View>
            <WebEventPanel />
          </View>
        ))}
      {!isWeb() && !onCalendar ? (
        <View
          style={
            isWeb() && { width: "100%", maxWidth: 1280, alignSelf: "center" }
          }
        >
          <EventListView
            events={
              eventList
                ? eventList.filter((e): e is Doc<"events"> => e !== null)
                : undefined
            }
            inClub={true}
            onPress={handleEditEvent}
            canDelete={isAdmin}

            onDelete={handleDeleteEvent}
            inCalendar={true}
            inCreation={false}

            onEdit={handleEditEvent}

            onCancel={handleCancelEvent}
          />
          {(eventList?.length == 0 ||
            dayjs(lastEvent.dateNumber).isBefore(currentDate, "day")) && (
            <Text
              style={{
                color: COLORS.textPrimary,
                fontSize: 24,
                alignItems: "center",
                textAlign: "center",
                marginTop: 20,
              }}
            >
              No Upcoming Events!
            </Text>
          )}
        </View>
      ) : (
        !isWeb() && (
          <View>
            <Calendar
              admin={true}
              eventList={eventDaySet}
              onCellPress={(day) => {
                if (pressedDay?.isSame(day, "day")) {
                  bottomSheetRef.current
                    ? bottomSheetRef.current.close()
                    : null;
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
        )
      )}
    </View>
  );

  const fullAnnouncements = useMemo(() => {
    return validAnnouncements
      .slice()
      .sort((a, b) => {
        return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      })
      .map((announcement) => {
        const matchingEvent = (club?.eventList ?? []).find(
          (event) => event?._id === announcement.event,
        );

        return {
          ...announcement,
          eventData: matchingEvent ?? undefined,
        };
      });
  }, [validAnnouncements, club?.eventList]);

  const AnnouncementsTab = () => (
    <View
      style={
        isWeb() && {
          width: "100%",
          maxWidth: 1280,
          alignSelf: "center",

          height: "100%",
        }
      }
    >
      {fullAnnouncements.length >= 1 && (
        <FlatList
          data={fullAnnouncements}
          keyExtractor={(item) => item?._id.toString() ?? index.toString()}
          initialNumToRender={5}
          windowSize={5}
          scrollEnabled
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={5}
          renderItem={({ item }) =>
            item ? (
              <Announcement
                description={item.message}
                image={item.image}
                dateCreated={item.datePosted}
                eventId={item.eventData?._id}
                pinned={item.pinned}
                isAdmin={isAdmin}
                createdBy={item.postedBy}
                onPin={(isPinned) => {
                  setPinnedStatus({
                    announcementId: item._id,
                    status: isPinned ?? false,
                  });
                }}
                onDelete={() => {
                  deleteAnnouncement({ announcementId: item._id });
                }}
                creatorName={item.creatorName}
                creatorPFP={item.creatorPFP}
              />
            ) : null
          }
        />
      )}

      {fullAnnouncements.length < 1 && (
        <View style={{}}>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: 24,
              alignItems: "center",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            No announcements to show!
          </Text>
        </View>
      )}
    </View>
  );
  const [deleteVisable, setDeleteVisable] = useState(false);
  const translateYSaveButton = useRef(new Animated.Value(200)).current;
  const hasBeenShown = useRef(false);

  const [hasChanges, setHasChanges] = useState(false);
  const isMounted = useRef(false);
  useEffect(() => {
    // skip the very first render only
    if (!hasBeenShown.current && !hasChanges) return;

    // once it's been shown at least once, always animate
    if (hasChanges) hasBeenShown.current = true;

    Animated.spring(translateYSaveButton, {
      toValue: hasChanges ? 0 : 200,
      useNativeDriver: true,
      damping: 15,
      stiffness: 150,
    }).start();
  }, [hasChanges]);

  const SettingsTab = () => (
    <View
      style={
        isWeb() && {
          width: "100%",
          height: "100%",
          maxWidth: 1280,
          alignSelf: "center",
        }
      }
    >
      <ScrollView>
        <View style={[styles.infoSection]}>
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

          {canEditClub && (
            <Text style={styles.infoText}>
              Status:{" "}
              <Text
                style={{
                  color: status ? COLORS.publicGreen : COLORS.privateRed,
                }}
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
          )}
          {canEditClub && (
            <Pressable
              onPress={
                status
                  ? () => {
                      setStatus(false);
                      setHasChanges(true);
                    }
                  : () => {
                      setStatus(true);
                      setHasChanges(true);
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
                      ? "Users can currently" +
                        (club?.restricted ? " apply to join " : " join ") +
                        club?.name
                      : "Users can not currently" +
                        (club?.restricted ? " apply to join " : " join ") +
                        club?.name}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
          <View style={{ height: 40 }} />
          {!!canEditClub && (
            <>
              <SettingsButton
                title="Edit Club Info"
                onPress={handleEditClub}
                screenWidth={screenWidth}
              >
                <Feather name="edit" size={32} color={COLORS.textSecondary} />
              </SettingsButton>
            </>
          )}
          {(!!canEditClub || (!!isAdmin && !canEditClub)) && (
            <SettingsButton
              title="View Info Page"
              onPress={() => {
                router.push({
                  pathname: "/club/clubInfo",
                  params: { clubId: club?._id, isBrowsing: "false" },
                });
              }}
              screenWidth={screenWidth}
            >
              <Feather name="info" size={32} color={COLORS.textSecondary} />
            </SettingsButton>
          )}
          {!!canEditClub && (
            <>
              <SettingsButton
                title="Manage Officer Roles"
                onPress={handleEditRoles}
                screenWidth={screenWidth}
              >
                <Ionicons
                  name="podium-outline"
                  size={32}
                  color={COLORS.textSecondary}
                />
              </SettingsButton>
              <SettingsButton
                title="Assign Officers"
                onPress={handleAssignOfficers}
                screenWidth={screenWidth}
              >
                <MaterialIcons
                  name="assignment-ind"
                  size={32}
                  color={COLORS.textSecondary}
                />
              </SettingsButton>

              <Text
                style={{
                  fontFamily: "PoppinsSemiBold",
                  fontSize: 28,
                  color: COLORS.textPrimary,
                  alignSelf: "center",
                  marginHorizontal: 10,
                }}
              >
                Club Configurations
              </Text>
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View style={styles.schoolDiv} />
              </View>

              {/*<SettingsHeader title="Configurations" />*/}
              <SchoolSetting
                title="Admins Need Approval"
                description="Require admins to be manually approved by other admins before they can manage the club."
                value={adminsNeedApproval}
                onValueChange={() => {
                  setAdminsNeedApproval(!adminsNeedApproval);
                  setHasChanges(true);
                }}
                overrideLabel={
                  currentUser?.userData?.school?.configurations
                    ?.adminsNeedApproval !== adminsNeedApproval
                    ? "Overridden by School Settings"
                    : undefined
                }
              />
              <SchoolSetting
                title="Members Need Approval"
                description={
                  "Require members to be manually approved before they can join the club" +
                  (club?.restricted
                    ? " (enabled by default for restricted clubs)."
                    : ".")
                }
                value={membersNeedApproval}
                onValueChange={() => {
                  setMembersNeedApproval(!membersNeedApproval);
                  setHasChanges(true);
                }}
              />
            </>
          )}
          <View style={{ justifyContent: "flex-end" }}>
            {isStudent(currentUser?.userData.role) ? (
              <GradientButton
                onPress={
                  notInClub && club?._id
                    ? () => handleJoin(club._id)
                    : club?._id &&
                        (currentUser?.userData.role === "student" ||
                          (isAdmin &&
                            club?.advisors &&
                            club?.advisors?.length > 1))
                      ? () => handleLeave(club?._id)
                      : () => {}
                }
                title={notInClub ? "Join Club" : "Leave Club"}
                restricted={
                  (!club?.advisors || club?.advisors?.length <= 1) && isAdmin
                }
              />
            ) : (
              <ButtonPair
                buttonTitles={["Delete Club", "Leave Club"]}
                buttonTypes={[2, 1]}
                onPress={[
                  () => setDeleteVisable(true),
                  notInClub && club?._id
                    ? () => handleJoin(club._id)
                    : club?._id &&
                        (currentUser?.userData.role === "student" ||
                          (isAdmin &&
                            club?.advisors &&
                            club?.advisors?.length > 1))
                      ? () => handleLeave(club?._id)
                      : () => {},
                ]}
                buttonWidth={isWeb() ? 500 : 150}
              />
            )}
            {(!club?.advisors || club?.advisors?.length <= 1) && isAdmin && (
              <Text style={[styles.infoText, { textAlign: "center" }]}>
                You cannot leave a club with no other advisors.
              </Text>
            )}
            {notInClub && (
              <Text style={[styles.infoText, { textAlign: "center" }]}>
                As a Head Administrator, you can view all club activity without
                joining. To participate in club activity, join the club.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
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
      {isWeb() && <WebTopNav />}
      {!isWeb() && menuVisableMemo && (
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
                <TouchableOpacity onPress={() => router.push("/(tabs)")}>
                  <Text style={styles.menuItem}>Home</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </>
      )}
      {/* animated club header for info tab */}
      {/*!isWeb() && (
        <Animated.View
          style={[
            styles.infoHeader,
            {
              height: HEADER_EXPANDED_HEIGHT,
              transform: [{ translateY: headerTranslateY }],
              backgroundColor: COLORS.background,
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
                  color={club.clubColor}
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
                    <Ionicons
                      name="image"
                      color={COLORS.background}
                      size={20}
                    />
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}
          </Animated.View>
          <View
            style={{
              alignSelf: "flex-end",
              width: "100%",
              height: 10,
              backgroundColor: club?.clubColor,
              top: -5,
              zIndex: -20,
            }}
          />
        </Animated.View>
      )*/}
      {/* Icon to open hanmburger menu */}
      {!isWeb() && (
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            paddingHorizontal: 10,
            paddingTop: 0,
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
                  bottomSheetRef.current
                    ? bottomSheetRef.current.close()
                    : null;
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
        </View>
      )}
      {isWeb() && inEventTab && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Pressable
            onPress={() => {
              setPressedDay(undefined);
              setOnCalendar(true);
            }}
          >
            <Ionicons
              name="list"
              color={onCalendar ? COLORS.textPrimary : COLORS.textMuted}
              size={32}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              setPressedDay(undefined);
              setOnCalendar(false);
            }}
          >
            <Ionicons
              name="calendar"
              color={!onCalendar ? COLORS.textPrimary : COLORS.textMuted}
              size={28}
              style={{ paddingHorizontal: 10 }}
            />
          </Pressable>
        </View>
      )}
      <Animated.View
        style={{
          flex: 1,

          transform: [
            { translateY: true ? new Animated.Value(0) : contentTranslateY },
          ],
        }}
      >
        <TabView
          swipeEnabled={false}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={() => null}
        />

        <Animated.View
          style={[
            styles.saveButton,
            { bottom: 0, transform: [{ translateY: translateYSaveButton }] },
          ]}
        >
          <TouchableOpacity
            onPress={handleSaveSettings}
            style={styles.pressable}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
      {/* Modal for user information in the members tab*/}
      {
        <UserInfoModal
          visible={!!selectedMember}
          onClose={() => setSelectedMember(undefined)}
          user={selectedMember}
          clubRole={getRole(selectedMember?._id)}
          isAdvisor={
            selectedMember?._id && club?.advisors?.includes(selectedMember?._id)
          }
          dateJoined={
            clubList.find((m) => m.userId === selectedMember?._id)?.dateJoined
          }
        />
      }
      {club?._id && (
        <DeletionModal
          title={club?.name}
          description="Your Club will be permanently deleted and cannot be recovered."
          visible={deleteVisable}
          onClose={() => setDeleteVisable(false)}
          onConfirm={() => handleDelete(club?._id)}
        />
      )}
      {
        /* FAB for announcement and event creation */
        canEditClub && (
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

      {/* 
        A bottom sheet which appears when a date is pressed on the calendar, showing all events for that day.
        This is also where the user can create and edit events and announcements.
      */}
      {!isWeb() && bottomSheetType !== 2 ? (
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
                        onPress={
                          event ? () => handleEditEvent(event) : () => {}
                        }
                        canDelete={isAdmin}
                        onDelete={
                          event ? () => handleDeleteEvent(event) : undefined
                        }
                        onEdit={
                          event ? () => handleEditEvent(event) : undefined
                        }

                        onCancel={
                          event ? () => handleCancelEvent(event) : undefined
                        }
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
                  <Text
                    style={{
                      fontSize: 14,
                      color: COLORS.textSecondary,
                      textDecorationLine: "underline",
                    }}
                  >
                    View All Club Events
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableWithoutFeedback
              onPressIn={Platform.OS === "web" ? undefined : Keyboard.dismiss}
            >
              <BottomSheetComponent />
            </TouchableWithoutFeedback>
          </BottomSheetScrollView>
        </BottomSheet>
      ) : (
        <ManagementModal
          visible={modalOpen}
          title={modalTitle()}
          onClose={closeSheet}
          width={bottomSheetType === 9 ? 860 : undefined}
        >
          <BottomSheetComponent />
        </ManagementModal>
      )}
    </View>
  );
}

/*

(property) user: {
 _id: Id<"users">;
 _creationTime: number;
 role?: string | undefined;
 requestedParents?: Id<"users">[] | undefined;
 approvedParents?: Id<"users">[] | undefined;
 requestedChildren?: Id<"users">[] | undefined;
 approvedChildren?: Id<"users">[] | undefined;
 approvedAdmin?: boolean | undefined;
 gradeLevel?: number | undefined;
 school?: Id<"schools"> | undefined;
 requestedClubs?: Id<"clubs">[] | undefined;
 chats?: Id<"groupChats">[] | undefined;
 newMessages?: Id<"groupChats">[] | undefined;
 currentChat?: Id<"groupChats"> | undefined;
 ... 7 more ...;
 clerkId: string;
} | null

(property) user: {
 _id: Id<"users">;
 _creationTime: number;
 role?: string | undefined;
 requestedParents?: Id<"users">[] | undefined;
 approvedParents?: Id<"users">[] | undefined;
 requestedChildren?: Id<"users">[] | undefined;
 approvedChildren?: Id<"users">[] | undefined;
 approvedAdmin?: boolean | undefined;
 gradeLevel?: number | undefined;
 school?: Id<"schools"> | undefined;
 requestedClubs?: Id<"clubs">[] | undefined;
 chats?: Id<"groupChats">[] | undefined;
 newMessages?: Id<"groupChats">[] | undefined;
 currentChat?: Id<"groupChats"> | undefined;
 ... 7 more ...;
 clerkId: string;
} | null


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
const webStyles = StyleSheet.create({
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlternate,
    paddingHorizontal: 20,
    height: 56,
    gap: 16,
  },
  topNavIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 160,
  },
  topNavClubName: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    fontSize: 24,
    width: 400,
  },
  topNavTabs: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  topNavTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  topNavTabActive: {
    backgroundColor: `${COLORS.primary}22`,
  },
  topNavTabLabel: {
    fontSize: 16,
    fontFamily: "PoppinsMedium",
    color: COLORS.textSecondary,
  },
  topNavTabLabelActive: {
    color: COLORS.primary,
  },
  topNavHome: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: "flex-end",
    width: 400,
  },
  topNavHomeLabel: {
    color: COLORS.textSecondary,
    fontFamily: "PoppinsMedium",
    fontSize: 16,
  },
  calendarRow: {
    flex: 1,
    flexDirection: "row",
    gap: 20,

    paddingTop: 12,
    alignItems: "flex-start",
    paddingHorizontal: 50,
  },
  calendarContainer: {
    flex: 1,
    marginHorizontal: -50,

    alignItems: "center",
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
