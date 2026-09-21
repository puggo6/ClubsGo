import { COLORS } from "@/constants/theme";
import { Text, TouchableOpacity, View } from "react-native";

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
    <View>
      <Text
        selectable={false}
        style={{
          color: COLORS.textPrimary,
          fontSize: 16,
          fontFamily: "InterMedium",
          marginBottom: 5,
        }}
      >
        Grade
      </Text>

      <Text
        selectable={false}
        style={{
          color: COLORS.textSecondary,
          fontSize: 13,
          marginBottom: 12,
        }}
      >
        Select your current grade
      </Text>

      <View
        style={{
          flexDirection: "column",

          gap: 8,
          alignItems: "center",
          width: "100%",
        }}
      >
        {GRADES.map((grade) => {
          const selected = value === grade.value;

          return (
            <TouchableOpacity
              key={grade.value}
              onPress={() => onChange(grade.value)}
              style={{
                width: "50%",
                minHeight: 46,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 11,

                backgroundColor: COLORS.surfaceAlternate,

                borderWidth: 1,
                borderColor: selected
                  ? COLORS.textPrimary
                  : "rgba(255,255,255,0.06)",
              }}
            >
              <Text
                selectable={false}
                style={{
                  color: selected ? COLORS.textPrimary : COLORS.textSecondary,
                  fontSize: 14,
                  fontFamily: selected ? "InterMedium" : "InterRegular",
                }}
              >
                {grade.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
