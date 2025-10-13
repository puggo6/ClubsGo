import { COLORS } from "@/constants/theme";
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: "center",
    maxHeight: 800,
    ...Platform.select({
      web: {
        marginHorizontal: 125,
        marginVertical: 60,
      },
      default: {
        marginHorizontal: 8,
        marginVertical: 6,
      },
    }),
  },
  headerContainer: {},
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  navText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#888",
    paddingHorizontal: 10,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  dayNameContainer: {
    width: `${100 / 7}%`,
    alignItems: "center",
  },
  dayNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  dayNames: {
    fontFamily: "RalewayLight",
    fontSize: 14,
    color: COLORS.textPrimary,
    letterSpacing: 0.05,
  },
  dayCell: {
    width: `${100 / 7}%`,

    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 5,
    position: "relative",
    ...Platform.select({
      web: {
        aspectRatio: 2,
      },
      default: {
        aspectRatio: 1,
      },
    }),
  },
  dayCellPlaceholder: {
    width: `${100 / 7}%`,

    ...Platform.select({
      web: {
        aspectRatio: 2,
      },
      default: {
        aspectRatio: 1,
      },
    }),
  },
  dayCellContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  dayText: {
    fontSize: 18,
    fontFamily: "InterSemiBold",
    color: COLORS.textPrimary,
  },
  greyDayText: {
    fontSize: 18,
    fontFamily: "InterSemiBold",
    color: COLORS.textMuted,
  },
  selectionCircle: {
    borderWidth: 2,
    borderColor: "#2D9CDB", // I dont want it to be as vibrant as the primary
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  filledCircle: {
    backgroundColor: "#0d7991",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  unSelected: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  eventDotContainer: {
    position: "absolute",
    bottom: 4,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    rowGap: 2,
  },
  eventDot: {
    margin: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  pDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
    alignSelf: "center",
  },
  pageHeader: {
    paddingTop: 0,
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
    marginTop: -8,
  },
  gradientBar: {
    height: 3,
    borderRadius: 2,
    marginBottom: 12,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
