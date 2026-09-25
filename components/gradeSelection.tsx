import { COLORS } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";

type Props = {
  value?: number;
  onChange: (grade: number) => void;
};

const GRADES: { value: number; label: string }[] = [
  { value: 7, label: "7th Grade" },
  { value: 8, label: "8th Grade" },
  { value: 9, label: "Freshman" },
  { value: 10, label: "Sophomore" },
  { value: 11, label: "Junior" },
  { value: 12, label: "Senior" },
];

export default function GradeSelector({ value, onChange }: Props) {
  return (
    <View style={{ width: "100%", paddingHorizontal: 20 }}>
      <View style={{ marginLeft: 50 }}>
        <Text
          selectable={false}
          style={{
            color: COLORS.textPrimary,
            fontSize: 16,
            fontFamily: "InterMedium",
          }}
        >
          Grade
        </Text>

        <Text
          selectable={false}
          style={{
            color: COLORS.textSecondary,
            fontSize: 13,
          }}
        >
          Select your current grade
        </Text>
        <View
          style={{
            backgroundColor: COLORS.surfaceAlternate,
            width: "90%",
            height: 2,
            marginTop: 4,
            marginBottom: 30,
          }}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
        }}
      >
        {GRADES.map((grade) => {
          const selected = value === grade.value;

          const tile = (
            <Pressable
              onPress={() => onChange(grade.value)}
              style={({ pressed }) => ({
                width: "100%",
                minHeight: 52,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 11,
                backgroundColor: selected
                  ? COLORS.surface
                  : COLORS.surfaceAlternate,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text
                selectable={false}
                style={{
                  color: selected ? COLORS.textPrimary : COLORS.textSecondary,
                  fontSize: 14,
                  fontFamily: selected ? "InterSemiBold" : "InterRegular",
                }}
              >
                {grade.label}
              </Text>
            </Pressable>
          );

          return (
            <View key={grade.value} style={{ width: "33%" }}>
              {selected ? (
                <LinearGradient
                  colors={["#f64f59", "#c471ed", "#12c2e9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 12, padding: 2 }}
                >
                  {tile}
                </LinearGradient>
              ) : (
                <View
                  style={{
                    borderRadius: 12,
                    padding: 2,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  {tile}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
