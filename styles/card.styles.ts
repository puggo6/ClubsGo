import { COLORS } from "@/constants/theme";
import { Dimensions, Platform, StyleSheet } from "react-native";
const screenWidth = Dimensions.get("window").width;
export const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,

    borderRadius: 25,
    paddingHorizontal: 13,
    minWidth: 360,
    marginBottom: 15,
    minHeight: 85,
    width: screenWidth * 0.9,
    justifyContent: "flex-start",
    ...Platform.select({
      web: {
        width: "100%", // Use full width on web
        maxWidth: 900, // Optional max to avoid stretching too far
        alignSelf: "center",
      },
    }),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  clubName: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    fontSize: 24,
    marginBottom: 0,

    paddingRight: 6,
    ...Platform.select({
      web: {
        width: "100%",
      },
      default: {
        width: 200,
      },
    }),
  },
  clubInfo: {
    color: COLORS.textSecondary,
    fontFamily: "OpenSansRegular",
    fontSize: 12,
  },
  bottomMargin: {
    height: 0,
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",

    height: 85,
  },
  componentsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tagsContainer: {
    alignItems: "center",
    paddingTop: 5,
    flexDirection: "column",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    height: 85,
  },
  expandedContent: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  descriptionText: {
    fontSize: 12,
    fontFamily: "OpenSansLight",
    lineHeight: 16,
    color: COLORS.textPrimary,
    marginVertical: 2.5,
    textAlign: "center",
    paddingBottom: 4,
    alignSelf: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#D9D9D9",
    marginVertical: 10,
    width: "100%",
  },
  clubText: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginTop: 3.5,
  },
  restrictedContainer: {
    width: 30,
    aspectRatio: 1,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceIcon,
    borderRadius: 40,
    right: -6,
    top: -6,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,

    shadowColor: "#000",
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  titleText: {
    alignItems: "center",
    justifyContent: "center",

    minHeight: 32,
  },
});
