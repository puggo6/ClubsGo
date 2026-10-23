import { Dimensions, Platform } from "react-native";

const MOBILE_WEB_BREAKPOINT = 768;

export default function isWeb() {
  if (Platform.OS !== "web") return false;
  const { width } = Dimensions.get("window");
  return width >= MOBILE_WEB_BREAKPOINT;
}
