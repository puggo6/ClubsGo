import isWeb from "@/constants/isWeb";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import ClubCard from "./clubCard";

type props = {
  child: Doc<"users">;

  onClubPress: (clubId: Id<"clubs">) => void;
};

export default function ChildClubs({ child, onClubPress }: props) {
  const clubs = child.clubs;
  const fullClubs = useQuery(api.clubs.getClubList, { clubList: clubs });
  console.log(fullClubs);
  const goodClubs = fullClubs?.filter((c) => c !== undefined && c !== null);

  return (
    <View style={[styles.container, !!isWeb() && { width: "100%" }]}>
      <Text style={styles.header}>
        {child.fullName.substring(0, child.fullName.indexOf(" ")) + "'s Clubs"}
      </Text>
      <View style={styles.cardsContainer}>
        <FlatList
          data={goodClubs}
          keyExtractor={(item) =>
            item?._id?.toString() ?? Math.random.toString()
          }
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View>
              {item && (
                <ClubCard
                  onPress={() => onClubPress(item._id)}
                  club={item}
                  joinCard={false}
                  canManage={false}
                  child
                />
              )}
            </View>
          )}
          horizontal={false}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsSemiBold",
    fontSize: 32,
    alignSelf: "center",
  },
  cardsContainer: {
    paddingBottom: 100,
  },
});
