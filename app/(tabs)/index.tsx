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
import { Pager } from "@/components/pager";
import {
  hasAdminAccess,
  isHeadAdmin,
  isParent,
  isStudent,
} from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/browse.styles";
import { AntDesign } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetFooter,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types";
import { useMutation } from "convex/react";
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
import { Animated, Dimensions, SectionList, Text, View } from "react-native";
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

  const bottomSheetRef = useRef<BottomSheet>(null);
  const handleOpenSheet = () => {
    bottomSheetRef.current?.expand(); // opens to the first snap point
  };
  const handleCloseSheet = () => {
    bottomSheetRef.current?.close(); // opens to the first snap point
    forceRerender();
  };
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRerender = () => setRefreshKey((k) => k + 1);
  const snapPoints = ["100%", "75%", "50%"];
  const handleHaptics = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };
  const screenWidth = Dimensions.get("window").width;
  const school = currentUser?.userData.school;

  const rawClubList = currentUser?.userData.clubs ?? [];
  const [bottomSheetMode, setBottomMode] = useState<number>(0); // 0 for club creation, 1 for announcement, 2 for event
  const pendingClubList = useMemo(() => {
    return (currentUser?.userData.requestedClubs ?? []).filter(
      (c): c is NonNullable<typeof c> => c !== null
    );
  }, [currentUser?.userData.requestedClubs]);

  const reqChildList = useMemo(() => {
    return (currentUser?.userData.requestedChildren ?? []).filter(
      (c): c is NonNullable<typeof c> => c !== null
    );
  }, [currentUser?.userData.requestedChildren]);
  const appChildList = useMemo(() => {
    return (currentUser?.userData.approvedChildren ?? []).filter(
      (c): c is NonNullable<typeof c> => c !== null
    );
  }, [currentUser?.userData.approvedChildren]);

  const clubList = useMemo(() => {
    return (currentUser?.userData.clubs ?? []).filter(
      (c): c is NonNullable<typeof c> => c !== null
    );
  }, [currentUser?.userData.clubs]);
  const [clubData, setClubData] = useState<typeof clubList>(clubList);
  const [localClubs, setLocalClubs] = useState(clubList);
  const handleClubPress = () => {
    setBottomMode(0);
    handleOpenSheet();
  };
  const handleAnnouncementPress = () => {
    setBottomMode(1);
    handleOpenSheet();
  };
  const handleEventPress = () => {
    setBottomMode(2);
    handleOpenSheet();
  };
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
    []
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
    console.log("routed to management");
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
  const DATA = [
    {
      title: "Joined Clubs",
      data: localClubs,
    },
    {
      title: "Pending Clubs",
      data: pendingClubList,
    },
  ];

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
                    ? " to create a school!"
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
      <ScrollView>
        {!isParent(role) && school && !noClubs && (
          <>
            {/*  <HomeDashboard />*/}
            <Pager
              pages={[
                <HomeDashboard />,
                <View>
                  <Text style={{ color: COLORS.textPrimary }}>Blud</Text>
                </View>,
              ]}
            />
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
        {isParent(role) && (
          <>
            <Pager
              pages={[
                <HomeDashboard />,
                <View>
                  <Text style={{ color: COLORS.textPrimary }}>Blud</Text>
                </View>,
              ]}
            />
            <View style={styles.cardsContainer}>
              <SectionList
                sections={PARENT_DATA}
                keyExtractor={(item) => item._id.toString()}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                  <View>
                    <ChildCard
                      userPFP={item.profilePicture}
                      name={item.fullName}
                      email={item.email}
                      onPress={() => {}}
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
        {school && hasAdminAccess(role) && (
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
      {
        <View
          style={{
            alignItems: "flex-end",
            justifyContent: "flex-end",
            paddingRight: 22,
            paddingBottom: 70,
            flex: 1,
          }}
        >
          {!currentUser.userData.school && (
            <AntDesign name="arrow-down" size={40} color={COLORS.textPrimary} />
          )}
        </View>
      }
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
          </BottomSheetScrollView>
        </BottomSheet>
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
