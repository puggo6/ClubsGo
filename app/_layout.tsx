import { toastConfig } from "@/components/globalToast";
import { COLORS } from "@/constants/theme";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { useFonts } from "expo-font";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { LogBox, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import InitialLayout from "../components/initialLayout";

export default function RootLayout() {
  LogBox.ignoreAllLogs(true);
  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#000000");
  }, []);

  const [fontsLoaded] = useFonts({
    InterLight: require("../assets/fonts/Inter_18pt-Light.ttf"),
    InterRegular: require("../assets/fonts/Inter_18pt-Regular.ttf"),
    InterSemiBold: require("../assets/fonts/Inter_18pt-SemiBold.ttf"),
    InterMedium: require("../assets/fonts/Inter_18pt-Medium.ttf"),
    InterBold: require("../assets/fonts/Inter_18pt-Bold.ttf"),
    InterBlack: require("../assets/fonts/Inter_18pt-Black.ttf"),
    InterExtraBold: require("../assets/fonts/Inter_18pt-ExtraBold.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsSemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
    PoppinsExtraBold: require("../assets/fonts/Poppins-ExtraBold.ttf"),
    OpenSansLight: require("../assets/fonts/OpenSans-Light.ttf"),
    OpenSansRegular: require("../assets/fonts/OpenSans-Regular.ttf"),
    OpenSansBold: require("../assets/fonts/OpenSans-Bold.ttf"),
    OpenSansSemiBold: require("../assets/fonts/OpenSans-SemiBold.ttf"),
    RalewayExtraLight: require("../assets/fonts/Raleway-ExtraLight.ttf"),
    RalewayLight: require("../assets/fonts/Raleway-Light.ttf"),
    RalewaySemiBold: require("../assets/fonts/Raleway-SemiBold.ttf"),
    RalewayBold: require("../assets/fonts/Raleway-Bold.ttf"),
    LatoBold: require("../assets/fonts/Lato-Bold.ttf"),
    LatoRegular: require("../assets/fonts/Lato-Regular.ttf"),
    MontserratExtraBold: require("../assets/fonts/Montserrat-ExtraBold.ttf"),
    MontserratBold: require("../assets/fonts/Montserrat-Bold.ttf"),
    MontserratMedium: require("../assets/fonts/Montserrat-Medium.ttf"),
    MontserratRegular: require("../assets/fonts/Montserrat-Regular.ttf"),
    NunitoRegular: require("../assets/fonts/Nunito-Regular.ttf"),
    NunitoMedium: require("../assets/fonts/Nunito-Medium.ttf"),
    NunitoSemiBold: require("../assets/fonts/Nunito-SemiBold.ttf"),
    NunitoBold: require("../assets/fonts/Nunito-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GestureHandlerRootView
        style={{ flex: 1, backgroundColor: COLORS.background }}
      >
        <ClerkAndConvexProvider>
          <SafeAreaProvider
            initialMetrics={initialWindowMetrics}
            style={{ flex: 1, backgroundColor: COLORS.background }}
          >
            <InitialLayout />
            <Toast config={toastConfig} />
          </SafeAreaProvider>
        </ClerkAndConvexProvider>
      </GestureHandlerRootView>
    </View>
  );
}
