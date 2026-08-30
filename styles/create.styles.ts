// styles/create.styles.ts
import { COLORS } from "@/constants/theme";
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "space-between",
    flexDirection: "column",
  },
  contentContainer: {
    flex: 1,
  },

  header: {
    paddingTop: 0,
    paddingBottom: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 40,
    color: COLORS.white,
    marginBottom: 0,
    marginTop: 0,
    fontFamily: "PoppinsBold",
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  inputSection: {
    padding: 16,
    flex: 1,
  },
  captionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  gradientBorder: {
    padding: 2,
    borderRadius: 10,
  },
  inputContainer: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    color: "#fff",
    fontSize: 16,
  },
  gradientBar: {
    height: 3,
    borderRadius: 2,
    marginBottom: 12,
  },
  bottomMargin: {
    height: 100,
  },
  inputsContainer: {
    flex: 1,

    padding: 20,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    gap: 12,
  },
  tagInputLabel: {
    color: "white",
    fontSize: 18,
    marginBottom: 4,
    fontFamily: "InterRegular",
    paddingHorizontal: 2,
  },
  tagInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    fontSize: 16,
    color: "#fff",
  },
  tagInputContainer: {
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  tagSelection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginVertical: 2,
    justifyContent: "center",
  },
  divider: {
    height: 2,
    backgroundColor: "#2a2a2a",
    width: "100%",
    marginVertical: 8,
  },
  schoolName: {
    fontSize: 28,
    fontFamily: "OpenSansBold",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  schoolInfoContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
    textAlign: "center",
  },
  infoText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: "OpenSansRegular",
    textAlign: "center",
  },
  restrictedContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  lockContainer: {
    width: 45,
    aspectRatio: 1,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceThree,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
  },
  restrictedText: {
    fontFamily: "PoppinsMedium",
    color: COLORS.textPrimary,
    marginLeft: 15,
    marginRight: 40,
    fontSize: 20,
  },
  restrictedOptions: {
    marginHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  optionsText: {
    marginVertical: 10,
    fontFamily: "LatoRegular",
    color: COLORS.textMuted,

    fontSize: 18,
  },
  dotIcon: {
    marginVertical: 10,
    color: COLORS.textMuted,
  },
  existingSchoolPrompt: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    marginBottom: 16,
  },

  existingSchoolText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: "InterRegular",
    marginBottom: 5,
  },

  existingSchoolLink: {
    color: COLORS.primary,
    fontSize: 15,
    fontFamily: "InterMedium",
  },
});
