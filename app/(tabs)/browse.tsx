import ClubCard from "@/components/clubCard";
import { StudentMemberCard } from "@/components/memberCard";
import { ConditionalPager } from "@/components/pager";
import Tag, { availableTags } from "@/components/tag";
import { isParent, isStudent } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSchoolData } from "@/hooks/useSchoolData";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/browse.styles";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { useMutation } from "convex/react";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Browse() {
  const currentUser = useUserData();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { schoolData } = useSchoolData();

  const currentDate = String(dayjs());
  const rawClubList = schoolData?.clubs ?? [];

  const requestedClubs =
    currentUser?.userData.requestedClubs?.map((club) => {
      if (!club) return null;
      return typeof club === "string" ? club : club._id;
    }) ?? [];

  const userClubs =
    currentUser?.userData?.clubs?.map((club) => {
      if (!club) return null;
      return typeof club === "string" ? club : club._id;
    }) ?? [];

  const fullClubList = rawClubList.filter(
    (c): c is NonNullable<typeof c> => c !== null
  );

  const clubList = fullClubList.filter((club) => {
    if (!club) return false;
    return !userClubs.includes(club._id) && !requestedClubs?.includes(club._id);
  });

  const requestChild = useMutation(api.users.requestChild);
  const handleChildReq = async (child: Id<"users">) => {
    await requestChild({ studentId: child });
  };

  const joinClub = useMutation(api.users.joinClub);
  const handelJoin = async (clubId: Id<"clubs">) => {
    try {
      await joinClub({ clubId, currentDate });
    } catch (error) {
      console.log("Error joining club:", error);
    }
  };
  const handleInfo = (club: Id<"clubs">) => {
    router.push({
      pathname: "/club/clubInfo",
      params: { clubId: club },
    });
  };
  const [searchQuery, setSearchQuery] = useState("");

  const [expanded, setExpanded] = useState(false);
  const [height, setHeight] = useState(95);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const animatedHeight = expanded ? withTiming(height) : withTiming(0);
    return {
      height: animatedHeight,
    };
  });

  const [freeTags, setFreeTags] = useState<string[]>(availableTags);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const selectTag = (tag: string) => {
    if (selectedTags.length > 2) return;
    setSelectedTags((prev) => [...prev, tag]);
    setFreeTags((prev) => prev.filter((t) => t !== tag));
    setExpanded(false);
  };
  const deselectTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
    setFreeTags((prev) => [...prev, tag]);
  };

  const filteredClubList = useMemo(() => {
    return clubList.filter((club) => {
      const matchesSearch =
        searchQuery.length === 0 ||
        club.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => club.tags?.includes(tag)); // assumes club.tags is an array

      return matchesSearch && matchesTags;
    });
  }, [searchQuery, clubList, selectedTags]);

  const clubPage = (
    <View style={styles.cardsContainer}>
      <FlatList
        data={filteredClubList}
        keyExtractor={(item) => item?._id ?? Math.random().toString()}
        contentContainerStyle={{ padding: 16 }}
        ListFooterComponent={<View />}
        ListFooterComponentStyle={{ height: 50 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ClubCard onPress={() => handleInfo(item._id)} club={item} />
        )}
      ></FlatList>
    </View>
  );

  // make it so that only students with the same last name show up by default and the user can choose to search all
  const requestedChildren = currentUser?.userData.requestedChildren.map(
    (u) => u?._id
  );
  const studentUsers = schoolData?.users
    .filter((u) => isStudent(u?.role))
    .filter((u) => !requestedChildren?.includes(u?._id));
  console.log(studentUsers);
  const parentPage = (
    <View onStartShouldSetResponder={() => true} style={{ flex: 1 }}>
      <FlatList
        data={studentUsers}
        keyExtractor={(item) => item?._id ?? Math.random().toString()}
        contentContainerStyle={{ padding: 16 }}
        ListFooterComponent={<View />}
        ListFooterComponentStyle={{ height: 50 }}
        renderItem={({ item }) => {
          return (
            item && (
              <StudentMemberCard
                email={item?.email ?? ""}
                userPFP={item?.profilePicture}
                name={item?.fullName ?? ""}
                onPress={() => handleChildReq(item._id)}
              />
            )
          );
        }}
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
    </View>
  );

  return (
    <TouchableWithoutFeedback
      onPressIn={() => {
        Platform.OS === "web" ? undefined : Keyboard.dismiss;
        setExpanded(false);
      }}
      style={{ flex: 1 }}
    >
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
          <Text style={styles.headerTitle}>Browse Clubs </Text>
        </View>
        <LinearGradient
          colors={["#12c2e9", "#c471ed", "#f64f59"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBar}
        />
        <View
          style={{
            flexDirection: "column",
            backgroundColor: "#1c1c1c",
            borderWidth: 1,
            borderColor: "#2a2a2a",
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginHorizontal: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />

            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: COLORS.textPrimary,
                marginLeft: 8,
              }}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={"Search"}
              placeholderTextColor="#888"
              autoCapitalize="sentences"
            />
            <View style={styles.selectedTags}>
              {selectedTags.map((tag) => (
                <Tag
                  key={tag}
                  category={tag}
                  visable={true}
                  onPress={() => deselectTag(tag)}
                />
              ))}
            </View>
            <Pressable onPress={toggleExpanded}>
              <AntDesign name="filter" color={COLORS.textSecondary} size={20} />
            </Pressable>
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
        <View style={{ flex: 1, alignItems: "center" }}>
          <ConditionalPager
            condition={true}
            surface={false}
            bottomDots={false}
            pages={
              isParent(currentUser?.userData.role)
                ? [parentPage, clubPage]
                : [clubPage]
            }
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
/*
<ClubCard
          name="Chess Club"
          members={0}
          date="Monday, 5/32"
          description="A place for students to learn learn and compete with eachother in the game of chess."
          tag1="Recreation"
        />
        <ClubCard
          name="Coding Club"
          members={55}
          date="Friday, 6/4"
          description="Blud Ohio"
          tag1="STEM"
          tag2="Academic"
          tag3="Other"
        />
        />


*/
