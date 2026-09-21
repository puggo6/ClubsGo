import isWeb from "@/constants/isWeb";
import { COLORS } from "@/constants/theme";
import { Entypo, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomProfile from "./customProfile";

type props = {
  userPFP?: string;
  name: string;
  dateJoined: string;
  isMember: boolean;
  onPress: () => void;
  approvalCard: boolean;
  role?: string;
};
type schoolProps = {
  userPFP?: string;
  name: string;
  email: string;
  isMember: boolean;
  onPress: () => void;
  approvalCard: boolean;
  isHead?: boolean;
};
type studentProps = {
  userPFP?: string;
  name: string;
  email: string;

  onPress: () => void;
};

type childProps = {
  userPFP?: string;
  name: string;
  email: string;
  approved: boolean;
  parent?: boolean;
  onPress?: () => void;
  onCardPress?: () => void;
  remove?: () => void;
};

type officerProps = {
  userPFP?: string;
  name: string;
  email: string;
  role?: string;
  dateJoined?: string;
  isEditing?: boolean;
  onPress: () => void;
};

export default function MemberCard({
  userPFP,
  name,
  dateJoined,
  isMember,
  onPress,
  approvalCard,
  role,
}: props) {
  let userStatus = "Pending approval";
  let userColor = "#FFB300";
  if (isMember) {
    userStatus = "Member";
    userColor = COLORS.publicGreen;
  }
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!imageUrl && userPFP) {
      setImageUrl(userPFP);
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.userAvatar} />
        ) : (
          <CustomProfile username={name} />
        )}
        <View style={styles.nameContainer}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.userName, isWeb() ? { width: "auto" } : {}]}
          >
            {name}
          </Text>
          <Text style={styles.userInfo}>
            Date Joined:{" "}
            <Text style={{ color: COLORS.accentA }}>{dateJoined}</Text>
          </Text>
          <Text style={styles.userInfo}>
            Status:{" "}
            <Text style={{ color: userColor }}>
              {userStatus}
              {role ? (
                <Text
                  style={{
                    color: COLORS.primary,
                    fontFamily: "OpenSansSemiBold",
                  }}
                >
                  {" "}
                  - {role}
                </Text>
              ) : (
                <></>
              )}
            </Text>
          </Text>
        </View>
        {approvalCard && (
          <View style={styles.outerButton}>
            <Pressable
              onPress={onPress}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>Approve</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
export function SchoolMemberCard({
  userPFP,
  name,
  email,
  isMember,
  onPress,
  isHead,
  approvalCard,
}: schoolProps) {
  let userStatus = "Pending approval";
  let userColor = String(COLORS.userColor);
  if (isMember) {
    userStatus = "Approved";
    userColor = COLORS.publicGreen;
  }
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!imageUrl && userPFP) {
      setImageUrl(userPFP); // Fetch once
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {!!imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.userAvatar} />
        )}
        <View style={styles.nameContainer}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.userName, isWeb() ? { width: "auto" } : {}]}
          >
            {name}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.userEmail, isWeb() ? { width: "auto" } : {}]}
          >
            {email}
          </Text>
          <Text style={styles.userInfo}>
            Status:{" "}
            <Text style={{ color: userColor }}>
              {userStatus}
              {isHead && (
                <Text style={{ color: COLORS.primary }}> - Head Admin</Text>
              )}
            </Text>
          </Text>
        </View>
        {approvalCard && (
          <View style={styles.outerButton}>
            <Pressable
              onPress={onPress}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>Approve</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

export function StudentMemberCard({
  userPFP,
  name,
  email,

  onPress,
}: studentProps) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!imageUrl && userPFP) {
      setImageUrl(userPFP); // Fetch once
    }
  }, []);

  return (
    <View style={[styles.container, isWeb() ? { width: "100%" } : {}]}>
      <View style={styles.contentContainer}>
        {!!imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.userAvatar} />
        )}
        <View style={styles.nameContainer}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.userName}>
            {name}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.userEmail, isWeb() ? { width: "auto" } : {}]}
          >
            {email}
          </Text>
        </View>

        <View
          style={[
            styles.outerButton,
            isWeb() ? { alignItems: "flex-end", flex: 1 } : {},
          ]}
        >
          <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>Add as a child</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function ChildCard({
  userPFP,
  name,
  email,
  approved,
  parent = false,
  onPress,
  remove,
  onCardPress,
}: childProps) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!imageUrl && userPFP) {
      setImageUrl(userPFP); // Fetch once
    }
  }, []);
  let userStatus = "Pending Approval";
  let userColor = "#FFB300";
  if (approved) {
    userStatus = "Approved";
    userColor = COLORS.publicGreen;
  }
  return (
    <TouchableOpacity
      onPress={onCardPress}
      activeOpacity={onCardPress ? 0.6 : 1}
    >
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {!!imageUrl && (
            <Image source={{ uri: imageUrl }} style={styles.userAvatar} />
          )}
          <View style={styles.nameContainer}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.userName, isWeb() ? { width: "auto" } : {}]}
            >
              {name}
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.userEmail, isWeb() ? { width: "auto" } : {}]}
            >
              {email}
            </Text>
            <Text style={styles.userInfo}>
              Status: <Text style={{ color: userColor }}>{userStatus}</Text>
            </Text>
          </View>
          {!approved && parent && (
            <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
              <View style={styles.checkButton}>
                <Entypo name="check" size={32} color={COLORS.textPrimary} />
              </View>
            </TouchableOpacity>
          )}
          {remove && approved && (
            <TouchableOpacity onPress={remove} style={{ flex: 1 }}>
              <View style={styles.checkButton}>
                <FontAwesome
                  name="remove"
                  size={32}
                  color={COLORS.textPrimary}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function OfficerMemberCard({
  userPFP,
  name,
  dateJoined,
  role,
  onPress,
  email,
  isEditing,
}: officerProps) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!imageUrl && userPFP) {
      setImageUrl(userPFP);
    }
  }, []);
  const formattedDate = dayjs(dateJoined).format("MM/DD/YYYY");
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.userAvatar} />
        ) : (
          <CustomProfile username={name} />
        )}
        <View style={styles.nameContainer}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.userName, isWeb() ? { width: "auto" } : {}]}
          >
            {name}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.userInfo, isWeb() ? { width: "auto" } : {}]}
          >
            {email}
          </Text>
          {dateJoined && (
            <Text style={styles.userInfo}>
              Date Joined:{" "}
              <Text style={{ color: COLORS.accentA }}>{formattedDate}</Text>
            </Text>
          )}
          <Text style={styles.userInfo}>
            Role:{" "}
            <Text
              style={{ color: role ? COLORS.primary : styles.userInfo.color }}
            >
              {role ? role : "N/A"}
            </Text>
          </Text>
        </View>

        <View style={styles.outerButton}>
          <Pressable
            onPress={onPress}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              isEditing ? { backgroundColor: COLORS.privateRed } : {},
            ]}
          >
            {isEditing ? (
              <FontAwesome5 name="minus" size={24} color={COLORS.textPrimary} />
            ) : (
              <FontAwesome5 name="plus" size={24} color={COLORS.textPrimary} />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function SmallMemberCard({ userPFP, name }: schoolProps) {
  let userStatus = "Pending approval";
  let userColor = "#FFB300";

  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!imageUrl && userPFP) {
      setImageUrl(userPFP); // Fetch once
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.contentContainer]}>
        {!!imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.userAvatar} />
        )}

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.userName, { width: 100 }]}
        >
          {name}
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {},
  contentContainer: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  userName: {
    fontSize: 20,
    fontFamily: "PoppinsMedium",
    color: COLORS.textPrimary,
    alignSelf: "flex-start",
    width: 150,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    color: COLORS.textSecondary,
    alignSelf: "center",
    marginTop: -3,
    width: 150,
  },
  userInfo: {
    fontFamily: "OpenSansRegular",
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  nameContainer: {
    flexDirection: "column",
  },
  outerButton: {
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: "InterSemiBold",
    fontWeight: 600,
  },
  divider: {
    alignSelf: "center",
    height: 2,
    backgroundColor: COLORS.surfaceLight,
    marginVertical: 10,
    paddingHorizontal: 30,
    width: "90%",
  },
  checkButton: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    paddingRight: 30,
    flex: 1,
  },
});
