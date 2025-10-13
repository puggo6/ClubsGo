import { styles } from "@/styles/clubManagement.styles";
import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";

type props = {
  onEventPress: () => void;
  onAnnouncementPress: () => void;
};

export default function FAB({ onEventPress, onAnnouncementPress }: props) {
  const [eventIcon] = useState(new Animated.Value(40));
  const [announcementIcon] = useState(new Animated.Value(40));

  const [pop, setPop] = useState(false);

  const popIn = () => {
    setPop(true);
    Animated.timing(eventIcon, {
      toValue: 130,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.sin),
    }).start();
    Animated.timing(announcementIcon, {
      toValue: 130,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.sin),
    }).start();
  };

  const popOut = () => {
    setPop(false);
    Animated.timing(eventIcon, {
      toValue: 40,
      duration: 300,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: false,
    }).start();
    Animated.timing(announcementIcon, {
      toValue: 40,
      duration: 300,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: false,
    }).start();
  };
  return (
    <View
      style={{
        alignItems: "flex-end",
        justifyContent: "flex-end",
        flex: 1,
      }}
    >
      {/* toggleCreateScreen*/}
      <Animated.View style={[styles.createButton, { bottom: eventIcon }]}>
        <TouchableOpacity onPress={onEventPress} onPressOut={popOut}>
          <Ionicons
            name="calendar"
            color={"white"}
            size={30}
            style={{ position: "fixed" }}
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.createButton, { right: announcementIcon }]}>
        <TouchableOpacity onPress={onAnnouncementPress} onPressOut={popOut}>
          <Ionicons
            name="megaphone"
            color={"white"}
            size={30}
            style={{ position: "fixed" }}
          />
        </TouchableOpacity>
      </Animated.View>
      <Pressable
        onPress={() => {
          pop === false ? popIn() : popOut();
        }}
      >
        <View style={[styles.createButton]}>
          <Feather name="plus" size={40} color="white" />
        </View>
      </Pressable>
    </View>
  );
}
