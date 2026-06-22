import { COLORS } from "@/constants/theme";
import { Entypo } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type props = {
  userPFP?: string;
  name: string;
  dateJoined: string;
  isMember: boolean;
  onPress: () => void;
  approvalCard: boolean;
};
type schoolProps = {
  userPFP?: string;
  name: string;
  email: string;
  isMember: boolean;
  onPress: () => void;
  approvalCard: boolean;
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
  onPress: () => void;
};

export default function MemberCard({
  userPFP,
  name,
  dateJoined,
  isMember,
  onPress,
  approvalCard,
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
      setImageUrl(userPFP); // Fetch once
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.userAvatar} />
        )}
        <View style={styles.nameContainer}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.userName}>
            {name}
          </Text>
          <Text style={styles.userInfo}>
            Date Joined:{" "}
            <Text style={{ color: COLORS.accentA }}>{dateJoined}</Text>
          </Text>
          <Text style={styles.userInfo}>
            Status: <Text style={{ color: userColor }}>{userStatus}</Text>
          </Text>
          <Text style={styles.userInfo}>Approval: {String(approvalCard)}</Text>
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
  approvalCard,
}: schoolProps) {
  let userStatus = "Pending approval";
  let userColor = "#FFB300";
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
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.userAvatar} />
        )}
        <View style={styles.nameContainer}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.userName}>
            {name}
          </Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.userEmail}>
            {email}
          </Text>
          <Text style={styles.userInfo}>
            Status: <Text style={{ color: userColor }}>{userStatus}</Text>
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
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.userAvatar} />
        )}
        <View style={styles.nameContainer}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.userName}>
            {name}
          </Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.userEmail}>
            {email}
          </Text>
        </View>

        <View style={styles.outerButton}>
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
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.userAvatar} />
        )}
        <View style={styles.nameContainer}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.userName}>
            {name}
          </Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.userEmail}>
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
        {imageUrl && (
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
    alignSelf: "center",
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
