import { COLORS } from "@/constants/theme";
import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cardsContainer: {
    paddingBottom: 100,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingBottom: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 40,
    color: COLORS.white,
    marginBottom: 0,
    marginTop: 0,
    fontFamily: "PoppinsBold",
  },
  subTitle: {
    fontFamily: "OpenSansRegular",
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: -4,
    marginBottom: 6,
  },
  divSpace: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  divTitle: {
    fontSize: 28,
    color: COLORS.white,
    marginBottom: 0,
    marginTop: 0,
    fontFamily: "PoppinsMedium",
  },
  gradientBar: {
    height: 3,
    borderRadius: 2,
    marginBottom: 20,
    marginTop: 0,
  },
  joinSchoolText: {
    fontFamily: "PoppinsBold",
    fontSize: 32,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  headerSchool: {
    paddingBottom: 10,
    paddingTop: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tagSelection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginVertical: 2,
    justifyContent: "center",
  },
  selectedTags: {
    gap: 6,
    marginRight: 20,
  },
  divider: {
    height: 2,
    backgroundColor: "#2a2a2a",
    width: "100%",
    marginVertical: 8,
  },
  hiddenComponent: {
    alignItems: "center",
    justifyContent: "center",
  },
  hiddenText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: "PoppinsBold",
    textAlign: "center",
  },
  createButton: {
    width: 60,
    aspectRatio: 1,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceAlternate,
    position: "absolute",
    bottom: 40,
    right: 40,
  },
});
