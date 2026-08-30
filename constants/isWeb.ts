import { Platform } from "react-native";

export default function isWeb() {
  return Platform.OS === "web";
}
