import isWeb from "@/constants/isWeb";
import { Keyboard, Pressable, View } from "react-native";

type props = {
  children: React.ReactNode;
  style?: any;
};

export default function DismissKeyboardView({ children, style }: props) {
  if (isWeb()) {
    return <View style={[{ flex: 1, width: "100%" }, style]}>{children}</View>;
  }
  return (
    <Pressable
      onPress={() => {
        Keyboard.dismiss();
      }}
      style={[{ flex: 1, width: "100%" }, style]}
    >
      {" "}
    </Pressable>
  );
}
