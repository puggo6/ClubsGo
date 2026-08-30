import isWeb from "@/constants/isWeb";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/auth.styles";
import { useSSO, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function login() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const { user } = useUser(); // must be called inside a component

  const redirectUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/sso-callback`
      : "myapp://sso-callback"; // deep link for mobile
  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl,
      });

      if (setActive && createdSessionId) {
        await setActive({ session: createdSessionId });
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandSection}>
        <Image
          source={
            !isWeb()
              ? require("@/assets/images/flatLogoTag.png")
              : require("@/assets/images/largeFlatLogoTag.png")
          }
          style={!isWeb() ? styles.topLogo : { width: "100%", height: 130 }}
        />
      </View>

      <View style={styles.loginSection}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-google" size={20} color={COLORS.surface} />
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our terms of service and privacy policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

export let roleSelected = false;
export function toggleRoleSelected() {
  roleSelected = !roleSelected;
}
