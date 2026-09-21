import { StudentMemberCard } from "@/components/memberCard";
import { StylizedSearch } from "@/components/stylizedInput";
import isWeb from "@/constants/isWeb";
import { isStudent } from "@/constants/roles";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSchoolData } from "@/hooks/useSchoolData";
import { useUserData } from "@/hooks/useUserData";
import { styles } from "@/styles/settings.styles";
import { AntDesign } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function parents() {
  const currentUser = useUserData();
  const { schoolData } = useSchoolData();
  const requestChild = useMutation(api.users.requestChild);
  const [searchQuery, setSearchQuery] = useState("");
  const handleChildReq = async (child: Id<"users">) => {
    await requestChild({ studentId: child });
  };
  // make it so that only students with the same last name show up by default and the user can choose to search all
  const requestedChildren = currentUser?.userData.requestedChildren.map(
    (u) => u?._id,
  );
  const approvedChildren = currentUser?.userData.approvedChildren.map(
    (u) => u?._id,
  );
  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return (schoolData?.users ?? [])
      .filter((u) => isStudent(u?.role))
      .filter(
        (u) =>
          !requestedChildren?.includes(u?._id) &&
          !approvedChildren?.includes(u?._id),
      )
      .filter((u) => {
        if (!query) return true;

        return u?.fullName?.toLowerCase().includes(query);
      });
  }, [schoolData?.users, searchQuery, requestedChildren, approvedChildren]);
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
        <Text style={styles.headerTitle}>Link Children</Text>
      </View>
      <LinearGradient
        colors={["#12c2e9", "#c471ed", "#f64f59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />
      <View style={isWeb() ? { maxWidth: 1280, width: "100%" } : {}}>
        {currentUser && (
          <View style={[{ flex: 1, marginTop: 20 }]}>
            <StylizedSearch
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={"Search"}
              dark={false}
            />
            <FlatList
              data={filteredStudents}
              keyExtractor={(item) => item?._id ?? Math.random().toString()}
              contentContainerStyle={{ padding: 16 }}
              ListFooterComponent={<View />}
              ListFooterComponentStyle={{ height: 50 }}
              renderItem={({ item }) => {
                return (
                  <View
                    style={
                      !!isWeb() && {
                        maxWidth: 800,
                        width: "100%",
                        alignSelf: "center",
                      }
                    }
                  >
                    {item && (
                      <StudentMemberCard
                        email={item?.email ?? ""}
                        userPFP={item?.profilePicture}
                        name={item?.fullName ?? ""}
                        onPress={() => handleChildReq(item._id)}
                      />
                    )}
                  </View>
                );
              }}
              ItemSeparatorComponent={({}) => (
                <View
                  style={{
                    alignSelf: "center",
                    height: 2,
                    backgroundColor: COLORS.surfaceLight,
                    marginVertical: 10,
                    paddingHorizontal: 30,
                    width: "90%",
                  }}
                />
              )}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
