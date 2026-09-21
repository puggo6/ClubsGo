import CreateSchool from "@/components/createSchool";
import JoinSchool from "@/components/joinSchool";
import SchoolDashboard from "@/components/schoolDashboard";
import { COLORS } from "@/constants/theme";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/create.styles";
import { useState } from "react";
import {
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function schoolSeletion() {
  const currentUser = useUserData();
  const insets = useSafeAreaInsets();
  const isNewUser = !currentUser?.userData.school;
  const isAdmin = currentUser?.userData.role == "superAdmin";
  const [headCreate, setHeadCreate] = useState(true);

  return (
    <TouchableWithoutFeedback
      onPressIn={Platform.OS === "web" ? undefined : Keyboard.dismiss}
      style={{ flex: 1 }}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: COLORS.background,
            paddingTop: insets.top,
            marginBottom: insets.bottom,
            marginRight: insets.right,
            marginLeft: insets.left,
          },
        ]}
      >
        {isAdmin ? (
          currentUser.userData.school ? (
            <SchoolDashboard />
          ) : headCreate ? (
            <CreateSchool onSwitch={() => setHeadCreate(false)} />
          ) : (
            <JoinSchool onSwitch={() => setHeadCreate(true)} />
          )
        ) : isNewUser ? (
          <JoinSchool />
        ) : (
          <SchoolDashboard />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

/*
<TouchableOpacity
        onPress={logTest}
        style={{ backgroundColor: "white", height: 50, width: 50 }}
      ></TouchableOpacity>
*/
