import { COLORS } from "@/constants/theme";
import { useUserData } from "@/hooks/useUserData";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabLayout() {
  const currentUser = useUserData();
  const showSchool =
    currentUser?.userData.role == "superAdmin" || !currentUser?.userData.school;
  const inSchool = Boolean(currentUser?.userData.school);
  const showCreate = currentUser?.userData.role != "student" && inSchool;
  const newMessages = false;
  return (
    <View style={{ backgroundColor: COLORS.background, flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.grey,
          tabBarStyle: {
            backgroundColor: COLORS.background,
            borderTopWidth: 0,
            position: "absolute",
            elevation: 0,
            height: 40,
            paddingBottom: 80,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="browse"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={size} color={color} />
            ),
            href: null,
          }}
        />

        <Tabs.Screen
          name="messages"
          options={{
            tabBarIcon: ({ color, size }) => (
              <>
                <Entypo name="chat" size={size} color={color} />
                {newMessages && (
                  <View
                    style={{
                      position: "absolute",
                      alignItems: "flex-end",
                      justifyContent: "flex-start",
                      top: -1,
                      right: -1,
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <View
                      style={{
                        aspectRatio: 1,
                        width: 8,
                        backgroundColor: COLORS.accentB,
                        borderRadius: 100,
                      }}
                    />
                  </View>
                )}
              </>
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
            href: inSchool ? undefined : null,
          }}
        />

        <Tabs.Screen
          name="schoolSelection"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="business" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
