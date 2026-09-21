import { COLORS } from "@/constants/theme";
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { DarkTheme, ThemeProvider } from "expo-router/react-navigation";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const user = useUserData();
  const roleSelected = user ? user.userData.role !== undefined : undefined;
  const bgScreen = () => {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}></View>
    );
  };
  useEffect(() => {
    if (!isLoaded || (isSignedIn && !user) || !segments) {
      return;
    }

    const inAuthPage = segments[0] === "(auth)";
    const inRoleSelect = segments[0] === "roleSelect";

    if (!isSignedIn && !inAuthPage) {
      router.replace("/(auth)/login");
    } else if (isSignedIn && inAuthPage && roleSelected) {
      router.replace("/(tabs)");
    } else if (
      isSignedIn &&
      inAuthPage &&
      roleSelected === false &&
      !inRoleSelect
    ) {
      router.replace("/(auth)/roleSelect");
    }
  }, [isLoaded, isSignedIn, segments, roleSelected]);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={COLORS.textSecondary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ThemeProvider value={DarkTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '"#121212",',
            },
          }}
        />
      </ThemeProvider>
    </View>
  );
}
