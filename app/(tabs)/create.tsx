import CreateSceenComp from "@/components/create";
import { router } from "expo-router";
import { View } from "react-native";

export default function Create() {
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
      }}
    >
      <CreateSceenComp onCreate={() => router.back()} editing={false} />
    </View>
  );
}
