import { COLORS } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

type props = {
  username: string;
};

export default function CustomProfile({ username }: props) {
  const letter = username.charAt(0);
  return (
    <View style={styles.userAvatar}>
      <Text style={styles.userName}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: COLORS.surfaceLight,
  },
  userName: {
    fontSize: 20,
    fontFamily: "PoppinsMedium",
    color: COLORS.textPrimary,
    alignSelf: "center",
    width: 150,
  },
});
