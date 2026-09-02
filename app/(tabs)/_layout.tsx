import { isAdmin } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { useUserData } from "@/hooks/useUserData";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Slot, Tabs, useRouter, useSegments } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

const isWeb = Platform.OS === "web";

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: boolean;
};

const SidebarItem = ({ icon, label, href, badge }: SidebarItemProps) => {
  const router = useRouter();
  const segments = useSegments();
  const isActive =
    "/" + (segments[1] ?? "index") === href ||
    (href === "/index" && segments[1] === undefined);

  return (
    <Pressable
      onPress={() => router.push(href as any)}
      // @ts-ignore - web only
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = COLORS.surfaceLight)
      }
      onMouseLeave={(e: {
        currentTarget: { style: { backgroundColor: string } };
      }) => (e.currentTarget.style.backgroundColor = "transparent")}
      style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
    >
      <View style={{ position: "relative" }}>{icon}</View>
      <Text
        style={[styles.sidebarLabel, isActive && styles.sidebarLabelActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const WebTopbar = ({
  inSchool,
  newMessage,
  canCreate,
}: {
  inSchool: boolean;
  newMessage: boolean;
  canCreate: boolean;
}) => {
  return (
    <View style={styles.topbar}>
      <Image
        source={require("@/assets/images/logoText.png")}
        contentFit="cover"
        style={{ height: 40, width: 200, bottom: -3 }}
      />

      <View style={styles.topbarNav}>
        <SidebarItem
          href="/"
          label="Home"
          icon={<Ionicons name="home" size={18} color={COLORS.textSecondary} />}
        />
        {inSchool && (
          <SidebarItem
            href="/browse"
            label="Browse"
            icon={
              <Ionicons name="search" size={18} color={COLORS.textSecondary} />
            }
          />
        )}
        {canCreate && inSchool && (
          <SidebarItem
            href="/create"
            label="Create"
            icon={
              <Ionicons name="add" size={18} color={COLORS.textSecondary} />
            }
          />
        )}
        {inSchool && (
          <SidebarItem
            href="/calendar"
            label="Calendar"
            icon={
              <Ionicons
                name="calendar"
                size={18}
                color={COLORS.textSecondary}
              />
            }
          />
        )}
        {inSchool && (
          <SidebarItem
            href="/messages"
            label="Messages"
            badge={newMessage}
            icon={<Entypo name="chat" size={18} color={COLORS.textSecondary} />}
          />
        )}

        <SidebarItem
          href="/schoolSelection"
          label="School"
          icon={
            <Ionicons name="business" size={18} color={COLORS.textSecondary} />
          }
        />

        <SidebarItem
          href="/settings"
          label="Settings"
          icon={
            <Ionicons
              name="person-circle"
              size={18}
              color={COLORS.textSecondary}
            />
          }
        />
      </View>
    </View>
  );
};
export default function TabLayout() {
  const currentUser = useUserData();
  const inSchool = Boolean(currentUser?.userData.school);
  const newMessage = (currentUser?.userData.newMessages?.length ?? 0) > 0;
  const canCreate =
    isAdmin(currentUser?.userData.role) &&
    (currentUser?.userData.approvedAdmin ?? false);
  if (isWeb) {
    return (
      <View style={styles.webContainer}>
        <WebTopbar
          inSchool={inSchool}
          newMessage={newMessage}
          canCreate={canCreate}
        />
        <View style={styles.webContent}>
          <Slot />
        </View>
      </View>
    );
  }

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
            href: inSchool ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            href: Platform.OS !== "web" ? null : inSchool ? undefined : null,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
            href: inSchool ? undefined : null,
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
                {newMessage && (
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
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    flexDirection: "column", // ← column instead of row
    backgroundColor: COLORS.background,
  },
  topbar: {
    height: 56,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlternate,
    flexDirection: "row", // ← items go horizontal
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  topbarNav: {
    flexDirection: "row", // ← nav items go horizontal
    alignItems: "center",
    gap: 4,
    marginLeft: 24,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sidebarItemActive: {
    backgroundColor: "transparent",
  },
  sidebarLabel: {
    fontSize: 13,
    fontFamily: "PoppinsMedium",
    color: COLORS.textSecondary,
  },
  sidebarLabelActive: {
    color: COLORS.primary,
  },
  webContent: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  logoText: {
    fontSize: 22,
    fontFamily: "PoppinsBold",
    color: COLORS.primary,
  },
  sidebarNav: {
    gap: 4,
  },
});
