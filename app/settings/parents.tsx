import Divider from "@/components/divider";
import { ChildCard } from "@/components/memberCard";
import isWeb from "@/constants/isWeb";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/settings.styles";
import { AntDesign } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, SectionList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function parents() {
  const currentUser = useUserData();

  const reqParentList = useMemo(() => {
    return (currentUser?.userData.requestedParents ?? []).filter(
      (c): c is NonNullable<typeof c> => c !== null,
    );
  }, [currentUser?.userData.requestedParents]);
  const appParentList = useMemo(() => {
    return (currentUser?.userData.approvedParents ?? []).filter(
      (c): c is NonNullable<typeof c> => c !== null,
    );
  }, [currentUser?.userData.approvedParents]);

  const PARENT_DATA = [
    {
      title: "Your Parents",
      data: appParentList,
    },
    {
      title: "Pending Parent Requests",
      data: reqParentList,
    },
  ];

  const requestChild = useMutation(api.users.approveParent);
  const removeParent = useMutation(api.users.removeParent);
  const handleChildReq = async (parent: Id<"users">) => {
    await requestChild({ parentId: parent });
  };

  const handleRemove = async (parent: Id<"users">) => {
    await removeParent({ parentId: parent });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        onPress={() => {
          router.back();
        }}
        style={{ justifyContent: "flex-start", width: "100%" }}
      >
        <AntDesign
          name="left"
          size={32}
          color={COLORS.textSecondary}
          style={{ marginLeft: 20 }}
        />
      </Pressable>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Parents</Text>
      </View>
      <LinearGradient
        colors={["#12c2e9", "#c471ed", "#f64f59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />
      <View style={isWeb() ? { maxWidth: 1280, width: "100%" } : {}}>
        {currentUser && (
          <SectionList
            sections={PARENT_DATA}
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View>
                <ChildCard
                  userPFP={item.profilePicture}
                  name={item.fullName}
                  email={item.email}
                  onPress={() => {
                    handleChildReq(item._id);
                  }}
                  approved={currentUser.userData.approvedParents
                    .map((c) => c?._id)
                    .includes(item._id)}
                  parent={true}
                  remove={() => handleRemove(item._id)}
                />
              </View>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <>
                <View style={styles.divSpace}>
                  <Text style={styles.divTitle}>{title}</Text>
                  <Divider />
                </View>
              </>
            )}
            horizontal={false} //
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
