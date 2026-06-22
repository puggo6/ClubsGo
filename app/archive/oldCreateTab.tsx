/*import GradientButton from "@/components/gradientButton";
import Tag, { availableTags } from "@/components/tag";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/create.styles";
import Entypo from "@expo/vector-icons/Entypo";
import { useMutation } from "convex/react";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  LayoutChangeEvent,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import StylizedInput from "../../components/stylizedInput";

export default function CreateSceen() {
  const router = useRouter();
  const [clubTitle, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [clubPublic, setClubPublic] = useState(false);
  const [dummyText, setDummyText] = useState("");

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeTags, setFreeTags] = useState<string[]>(availableTags);

  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const [restricted, setRestricted] = useState(false);
  const [restrictedType, setRestrictedType] = useState<0 | 1 | 2>(0);
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
  const currentUser = useUserData();
  const userSchoolId = currentUser?.userData.school?._id;
  const currentDate = String(dayjs());

  const [height, setHeight] = useState(0);
  const [restrictedHeight, setRestrictedHeight] = useState(120);

  const animatedStyle = useAnimatedStyle(() => {
    const animatedHeight = expanded ? withTiming(height) : withTiming(0);
    return {
      height: animatedHeight,
    };
  });
  const restrictedAnimatedStyle = useAnimatedStyle(() => {
    const animatedHeight = restricted
      ? withTiming(restrictedHeight)
      : withTiming(0);
    return {
      height: animatedHeight,
    };
  });

  const onLayout = (event: LayoutChangeEvent) => {
    const layoutHeight = event.nativeEvent.layout.height;

    if (layoutHeight !== 0 && layoutHeight !== height) {
      setHeight(layoutHeight);
    }
  };

  if (!userSchoolId) {
    console.error("userSchoolId is undefined");
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Loading User Data...</Text>
      </View>
    );
  }

  const handleCreate = async () => {
    if (!clubTitle || !description || selectedTags.length === 0) return; // add display which reads "missing required fields"

    try {
      await createClub({
        name: clubTitle,
        description,
        tags: selectedTags,
        restricted: restricted,
        restrictedType: restricted ? restrictedType : undefined,
        currentDate: currentDate,
      });
      await cleanClubs({ schoolId: userSchoolId });
      setTitle("");
      setDescription("");
      setSelectedTags([]);
      setFreeTags(availableTags);
      setClubPublic(false);
      setExpanded(false);
      console.log("created!");
      router.push("/(tabs)");
    } catch (error) {}
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={Platform.OS === "web" ? undefined : Keyboard.dismiss}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[styles.container, { flex: 1 }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create a Club </Text>
        </View>
        <LinearGradient
          colors={["#12c2e9", "#c471ed", "#f64f59"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBar}
        />
        <View style={styles.inputsContainer}>
          <StylizedInput
            label="Club Name"
            value={clubTitle}
            onChangeText={setTitle}
            placeholder="Enter club name I.E. 'Chess Club'"
            dark={false}
          />
          <StylizedInput
            label="Club Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter a brief description of the club "
            dark={false}
          />
          <View style={styles.tagInputContainer}>
            <Text
              style={[styles.tagInputLabel, { fontFamily: "InterRegular" }]}
            >
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
                */
{
  /* Placeholder render to get the expanded height (for reanimated expansion)*/
}
/*
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
            <Animated.View
              style={[restrictedAnimatedStyle, { overflow: "hidden" }]}
            >
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
        </View>

        <GradientButton title="Create" onPress={handleCreate} />
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
