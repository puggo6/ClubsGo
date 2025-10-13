import { COLORS } from "@/constants/theme";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
type props = {
  clubPress: () => void;
  announcementPress: () => void;
  eventPress: () => void;
};
export default function NewFAB({
  clubPress,
  announcementPress,
  eventPress,
}: props) {
  const firstVal = useSharedValue(30);
  const secondVal = useSharedValue(30);
  const thirdVal = useSharedValue(30);
  const isOpen = useSharedValue(false);
  const progress = useDerivedValue(() =>
    isOpen.value ? withTiming(1) : withTiming(0)
  );
  const config = {
    easing: Easing.bezier(0.68, -0.6, 0.32, 1.6),
    duraton: 500,
  };
  const handlePress = () => {
    if (isOpen.value) {
      firstVal.value = withTiming(30, config);
      secondVal.value = withDelay(50, withTiming(30, config));
      thirdVal.value = withDelay(100, withTiming(30, config));
    } else {
      firstVal.value = withDelay(200, withSpring(110));
      secondVal.value = withDelay(100, withSpring(100));
      thirdVal.value = withSpring(110);
    }
    isOpen.value = !isOpen.value;
  };
  const firstIcon = useAnimatedStyle(() => {
    const scale = interpolate(
      firstVal.value,
      [30, 110],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      right: firstVal.value,
      transform: [{ scale: scale }],
    };
  });
  const secondIcon = useAnimatedStyle(() => {
    const scale = interpolate(
      secondVal.value,
      [30, 100],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      bottom: secondVal.value,
      right: secondVal.value,
      transform: [{ scale: scale }],
    };
  });
  const thirdIcon = useAnimatedStyle(() => {
    const scale = interpolate(
      thirdVal.value,
      [30, 110],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      bottom: thirdVal.value,
      transform: [{ scale: scale }],
    };
  });
  const plusIcon = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${progress.value * 45}deg` }],
    };
  });
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.contentContainer, thirdIcon]}>
        <TouchableOpacity style={styles.iconContainer} onPress={clubPress}>
          <FontAwesome
            name="group"
            size={30}
            color="white"
            style={styles.icon}
          />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={[styles.contentContainer, secondIcon]}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={announcementPress}
        >
          <Ionicons
            name="megaphone"
            color={"white"}
            size={30}
            style={styles.icon}
          />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={[styles.contentContainer, firstIcon]}>
        <TouchableOpacity style={styles.iconContainer} onPress={eventPress}>
          <Ionicons
            name="calendar"
            color={"white"}
            size={30}
            style={styles.icon}
          />
        </TouchableOpacity>
      </Animated.View>
      <Pressable style={styles.contentContainer} onPress={() => handlePress()}>
        <Animated.View style={[styles.iconContainer, plusIcon]}>
          <Feather name="plus" size={40} color="white" style={styles.icon} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  contentContainer: {
    backgroundColor: COLORS.surfaceAlternate,
    position: "absolute",
    bottom: 30,
    right: 30,
    borderRadius: 50,
    borderWidth: 1,

    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
});
