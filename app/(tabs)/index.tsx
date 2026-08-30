import ChildClubs from "@/components/childClubs";
import ClubCard from "@/components/clubCard";
import CreateSceenComp from "@/components/create";
import CreateAnnouncement from "@/components/createAnnouncement";
import CreateEvent from "@/components/createEvent";
import Divider from "@/components/divider";
import { SizeGradientButton } from "@/components/gradientButton";
import HomeDashboard from "@/components/homeDashboard";
import LoadingScreen from "@/components/loadingScreen";
import { ChildCard } from "@/components/memberCard";
import NewFAB from "@/components/NewFAB";
import { WebCreateModal } from "@/components/webCreateModal";
import { isAdmin, isHeadAdmin, isParent, isStudent } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/browse.styles";
import { AntDesign } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetFooter,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
  Platform,
  SectionList,
  Text,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function index() {
  const currentUser = useUserData();
  const width = Dimensions.get("screen").width;
  const insets = useSafeAreaInsets();
  const role = currentUser?.userData.role;
  const [createTrigger, setCreateTrigger] = useState(0);
  const router = useRouter();
  const leaveClub = useMutation(api.users.leaveClub);
  const swipedRowRefs = useRef(new Set()); // Track which rows already triggered leave
  const isWeb = Platform.OS === "web";

  const bottomSheetRef = useRef<BottomSheet>(null);
  const handleOpenSheet = () => {
    bottomSheetRef.current?.expand(); // opens to the first snap point
  };
  const handleCloseSheet = () => {
    if (isWeb) {
      setWebModalVisible(false);
    } else {
      bottomSheetRef.current?.close();
    }
    forceRerender();
  };

  const modalTitle = () => {
    switch (bottomSheetMode) {
      case 0:
        return "Create Club";
      case 1:
        return "Create Announcement";
      case 2:
        return "Create Event";
      case 3:
        return currentChild?.fullName + "'s Clubs";
      default:
        return "";
    }
  };

  const [refreshKey, setRefreshKey] = useState(0);

  const forceRerender = () => setRefreshKey((k) => k + 1);
  const snapPoints = ["100%", "75%", "50%"];
  const handleHaptics = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };
  const screenWidth = Dimensions.get("window").width;
  const school = currentUser?.userData.school;
  const fullSchoolClubs =
    useQuery(api.clubs.getClubList, {
      clubList: currentUser?.userData.school?.clubList ?? [],
    }) ?? [];

  const rawClubList = currentUser?.userData.clubs ?? [];
  const [bottomSheetMode, setBottomMode] = useState<number>(0); // 0 for club creation, 1 for announcement, 2 for event
  const pendingClubList = useMemo(() => {
    return (currentUser?.userData.requestedClubs ?? []).filter(
      (c): c is NonNullable<typeof c> => c !== null,
    );
  }, [currentUser?.userData.requestedClubs]);

  const reqChildList = useMemo(() => {
    return (currentUser?.userData.requestedChildren ?? []).filter(
      (c): c is NonNullable<typeof c> => c !== null,
    );
  }, [currentUser?.userData.requestedChildren]);
  const appChildList = useMemo(() => {
    return (currentUser?.userData.approvedChildren ?? []).filter(
      (c): c is NonNullable<typeof c> => c !== null,
    );
  }, [currentUser?.userData.approvedChildren]);

  const clubList = useMemo(() => {
    const source = currentUser?.userData.clubs;

    return (source ?? []).filter((c): c is NonNullable<typeof c> => c !== null);
  }, [currentUser?.userData.clubs, currentUser?.userData.role]);

  const headClubs = useMemo(() => {
    const source = fullSchoolClubs;

    return (source ?? [])
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .filter(
        (c) => !currentUser?.userData.clubs.map((c) => c?._id).includes(c._id),
      );
  }, [
    currentUser?.userData.clubs,
    currentUser?.userData.role,
    fullSchoolClubs,
  ]);

  const [localClubs, setLocalClubs] = useState(clubList);

  const [webModalVisible, setWebModalVisible] = useState(false);

  const handleClubPress = () => {
    if (isWeb) {
      router.push("/(tabs)/create");
    } else {
      setBottomMode(0);
      isWeb ? setWebModalVisible(true) : handleOpenSheet();
    }
  };
  const handleAnnouncementPress = () => {
    setBottomMode(1);
    isWeb ? setWebModalVisible(true) : handleOpenSheet();
  };
  const handleEventPress = () => {
    setBottomMode(2);
    isWeb ? setWebModalVisible(true) : handleOpenSheet();
  };

  const [currentChild, setCurrentChild] = useState<Doc<"users"> | undefined>(
    undefined,
  );
  const handleChildPress = (child: Doc<"users">) => {
    setBottomMode(3);
    isWeb ? setWebModalVisible(true) : handleOpenSheet();
    setCurrentChild(child);
  };

  const childClubs = appChildList.map((c) => c.clubs).flat();
  const fullChildClubs =
    useQuery(api.clubs.getClubList, {
      clubList: childClubs,
    }) ?? [];

  const childEvents = fullChildClubs.map((c) => c.eventList).flat();
  console.log(appChildList);
  const userEvents = clubList.map((c) => c.eventList).flat();
  useEffect(() => {
    setLocalClubs(clubList);
  }, [clubList]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isNewUser = !Boolean(currentUser?.userData.school);
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
  const renderFooter = useCallback(
    (props: React.JSX.IntrinsicAttributes & BottomSheetDefaultFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={16}>
        <View style={{ paddingHorizontal: 30, paddingBottom: 80 }}>
          <SizeGradientButton
            onPress={() => setCreateTrigger(1)}
            title="Create"
            width={30}
            height={7}
            horizontalPadding={20}
          />
        </View>
      </BottomSheetFooter>
    ),
    [],
  );
  if (!currentUser) return <LoadingScreen />;
  if (currentUser.id === "not-in-db") {
    return (
      <Text style={styles.headerTitle}>
        Welcome! Setting up your account...
      </Text>
    );
  }

  const routeToManager = (club: Id<"clubs">) => {
    router.push({
      pathname: "/club/clubManagement",
      params: { clubId: club.toString(), tabIndex: 0 },
    });
  };

  const handleLeave = (clubId: Id<"clubs">) => {
    setLocalClubs((prev) => prev.filter((c) => c._id !== clubId));

    leaveClub({ clubId }).catch(() => {});
  };
  const noClubs =
    (!currentUser.userData.clubs || currentUser.userData.clubs.length === 0) &&
    (!currentUser.userData.requestedClubs ||
      currentUser.userData.requestedClubs.length === 0);
  const isApproved = (child: Doc<"users">) => {
    return appChildList.includes(child);
  };
  let DATA = [
    {
      title: "Joined Clubs",
      data: localClubs,
    },
  ];
  if (pendingClubList.length > 0) {
    DATA = [
      ...DATA,
      {
        title: "Pending Clubs",
        data: pendingClubList,
      },
    ];
  }
  if (isHeadAdmin(currentUser.userData.role) && headClubs.length > 0) {
    DATA = [
      ...DATA,
      {
        title: "Other School Clubs",
        data: headClubs,
      },
    ];
  }
  const PARENT_DATA = [
    {
      title: "Added Children",
      data: appChildList,
    },
    {
      title: "Pending Children",
      data: reqChildList,
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          marginBottom: insets.bottom,
          marginRight: insets.right,
          marginLeft: insets.left,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
      </View>
      <LinearGradient
        colors={["#12c2e9", "#c471ed", "#f64f59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />
      <View style={{}}>
        {!currentUser.userData.school && (
          <>
            <Text
              style={{
                fontFamily: "InterSemiBold",
                marginHorizontal: 20,
                marginVertical: 20,
                fontSize: 32,
                color: COLORS.textPrimary,
                textAlign: "center",
              }}
            >
              {!currentUser.userData.school
                ? "Tap the school icon " +
                  (isHeadAdmin(role)
                    ? "to create or join a school!"
                    : "and join a school to " +
                      (isStudent(role)
                        ? "join and participate in clubs!"
                        : isParent(role)
                          ? "manage your child's club activity!"
                          : "create and manage clubs!"))
                : "Join or create a club for it to show up here!"}
            </Text>
          </>
        )}
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {!isParent(role) && school && !noClubs && (
          <>
            {/*  <HomeDashboard />*/}
            {/*<Pager pages={[<HomeDashboard inputEventIds={userEvents} />]} />*/}
            <View
              style={{
                backgroundColor: COLORS.surface,

                borderRadius: 25,

                paddingVertical: 15,
                alignSelf: "center",
                alignItems: "center",

                marginBottom: 15,
                marginTop: 20,
                width: isWeb ? screenWidth * 0.66 : screenWidth * 0.95,
                justifyContent: "center",

                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.05)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <HomeDashboard inputEventIds={userEvents} />
            </View>

            <View style={styles.cardsContainer}>
              <SectionList
                sections={DATA}
                keyExtractor={(item) => item._id.toString()}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                  <View>
                    <ClubCard
                      onPress={() => routeToManager(item._id)}
                      club={item}
                      joinCard={false}
                      inBrowse={false}
                      canManage={
                        !currentUser.userData.requestedClubs
                          .map((club) => {
                            if (!club) return null;
                            return typeof club === "string" ? club : club._id;
                          })
                          .includes(item._id)
                      }
                    />
                  </View>
                )}
                renderSectionHeader={({ section: { title } }) => (
                  <>
                    <View style={styles.divSpace}>
                      <Text style={styles.divTitle}>{title}</Text>
                      <Divider />
                    </View>
                  </>
                )}
                horizontal={false} //
                scrollEnabled={true}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          </>
        )}

        {isParent(role) && currentUser.userData.school && (
          <>
            {/* <Pager
              pages={[
                <HomeDashboard inputEventIds={childEvents} />,
                <View>
                  <Text style={{ color: COLORS.textPrimary }}>Blud</Text>
                </View>,
              ]}
            />*/}
            <View
              style={{
                backgroundColor: COLORS.surface,

                borderRadius: 25,

                paddingVertical: 15,
                alignSelf: "center",
                alignItems: "center",

                marginBottom: 15,
                marginTop: 20,
                width: isWeb ? screenWidth * 0.66 : screenWidth * 0.95,
                justifyContent: "center",

                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.05)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <HomeDashboard inputEventIds={childEvents} />
            </View>
            <View
              style={[
                styles.cardsContainer,
                isWeb && {
                  maxWidth: 1600,
                  alignSelf: "center",
                  width: "100%",
                },
              ]}
            >
              <SectionList
                sections={PARENT_DATA}
                keyExtractor={(item) => item._id.toString()}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                  <View
                    style={
                      isWeb && {
                        maxWidth: 1280,
                        alignSelf: "center",
                        width: "100%",
                      }
                    }
                  >
                    <ChildCard
                      userPFP={item.profilePicture}
                      name={item.fullName}
                      email={item.email}
                      onCardPress={
                        isApproved(item)
                          ? () => handleChildPress(item)
                          : undefined
                      }
                      approved={currentUser.userData.approvedChildren
                        .map((c) => c?._id)
                        .includes(item._id)}
                    />
                  </View>
                )}
                renderSectionHeader={({ section: { title } }) => (
                  <>
                    <View style={styles.divSpace}>
                      <Text style={styles.divTitle}>{title}</Text>
                      <Divider />
                    </View>
                  </>
                )}
                horizontal={false} //
                scrollEnabled={true}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          </>
        )}
      </ScrollView>
      <View
        style={{
          right: 0,
          position: "absolute",
          bottom: 60,
        }}
      >
        {school &&
          isAdmin(currentUser.userData.role) &&
          !!(currentUser?.userData?.approvedAdmin ?? undefined) && (
            <NewFAB
              clubPress={handleClubPress}
              announcementPress={handleAnnouncementPress}
              eventPress={handleEventPress}
            />
          )}
      </View>
      {/* Text and arrow if the user is not in a school */}

      {/*{(currentUser.userData.role === "administrator" ||
        currentUser.userData.role === "superAdmin") &&
        currentUser.userData.school && (
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
                <Feather name="plus" size={40} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        )}*/}
      {!currentUser.userData.school && !isWeb && (
        <View
          style={{
            alignItems: "flex-end",
            justifyContent: "flex-end",
            paddingRight: 22,
            paddingBottom: 70,
            flex: 1,
          }}
        >
          {<AntDesign name="arrow-down" size={40} color={COLORS.textPrimary} />}
        </View>
      )}
      {school && (
        <>
          {!isWeb && (
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
              handleIndicatorStyle={{ backgroundColor: COLORS.textSecondary }}
              backgroundComponent={CustomBackground}
              keyboardBehavior="interactive"
              keyboardBlurBehavior="restore"
            >
              <BottomSheetScrollView style={{ paddingBottom: 30 }}>
                {bottomSheetMode === 0 && (
                  <CreateSceenComp
                    onCreate={handleCloseSheet}
                    editing={false}
                    key={refreshKey}
                  />
                )}
                {bottomSheetMode === 1 && (
                  <CreateAnnouncement
                    back={() => handleCloseSheet()}
                    key={refreshKey}
                    trigger={createTrigger}
                  />
                )}
                {bottomSheetMode === 2 && (
                  <CreateEvent
                    back={() => handleCloseSheet()}
                    key={refreshKey}
                    error={() => {
                      Toast.show({
                        type: "error",
                        text1: "Event Create Failed",
                        text2: "Missing Required Fields",
                        position: "top",
                        visibilityTime: 2500,
                        topOffset: 50,
                      });
                      handleHaptics();
                    }}
                  />
                )}
                {bottomSheetMode === 3 && currentChild && (
                  <ChildClubs
                    child={currentChild}
                    onClubPress={routeToManager}
                  />
                )}
              </BottomSheetScrollView>
            </BottomSheet>
          )}
          {isWeb && (
            <WebCreateModal
              visible={webModalVisible}
              onClose={handleCloseSheet}
              title={modalTitle()}
            >
              {bottomSheetMode === 0 && (
                <CreateSceenComp
                  onCreate={handleCloseSheet}
                  editing={false}
                  key={refreshKey}
                />
              )}
              {bottomSheetMode === 1 && (
                <CreateAnnouncement
                  back={() => handleCloseSheet()}
                  key={refreshKey}
                  trigger={createTrigger}
                />
              )}
              {bottomSheetMode === 2 && (
                <CreateEvent
                  back={() => handleCloseSheet()}
                  key={refreshKey}
                  error={() => {
                    Toast.show({
                      type: "error",
                      text1: "Event Create Failed",
                      text2: "Missing Required Fields",
                      position: "top",
                      visibilityTime: 2500,
                      topOffset: 50,
                    });
                    handleHaptics();
                  }}
                />
              )}
              {bottomSheetMode === 3 && currentChild && (
                <ChildClubs child={currentChild} onClubPress={routeToManager} />
              )}
            </WebCreateModal>
          )}
        </>
      )}
    </View>
  );
}

/*
{!isNewUser && (
        <View style={styles.headerSchool}>
          <Text style={styles.joinSchoolText}>
            Join a school to get started!
          </Text>
        </View>
      )}

      

        <SwipeListView
          data={localClubs}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={{ padding: 16 }}
          ListFooterComponent={<View />}
          ListFooterComponentStyle={{ height: 50 }}
          renderItem={({ item }) => (
            <ClubCard
              onPress={() => routeToManager(item._id)}
              club={item}
              joinCard={false}
            />
          )}
          renderHiddenItem={({ item }) => (
            <Animated.View
              style={[styles.hiddenComponent, { opacity: fadeAnim }]}
            >
              <Text style={styles.hiddenText}>Release to leave club</Text>
            </Animated.View>
          )}
          rightOpenValue={-Dimensions.get("window").width}
          onRowDidOpen={(rowKey) => {
            const clubId = rowKey as Id<"clubs">;
            handleLeave(clubId);
          }}
          onSwipeValueChange={({ value }) => {
            if (value < -20) {
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }).start();
            } else {
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }).start();
            }
          }}
        />


        ((currentUser.userData.role === "administrator" &&
        school?.adminList?.includes(currentUser.userData._id)) ||
        currentUser.userData.role === "superAdmin") &&
*/
