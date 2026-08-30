import { COLORS } from "@/constants/theme";
import { Switch, Text, View } from "react-native";

type SchoolSettingProps = {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export default function SchoolSetting({
  title,
  description,
  value,
  onValueChange,
  disabled = false,
}: SchoolSettingProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        width: "100%",
        borderRadius: 14,
        paddingVertical: 15,
        paddingHorizontal: 32,
        marginBottom: 10,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <View
        style={{
          flex: 1,
          paddingRight: 18,
          alignItems: "flex-start",
        }}
      >
        <Text
          selectable={false}
          style={{
            color: COLORS.textPrimary,
            fontSize: 15,
            fontWeight: "600",
            marginBottom: description ? 4 : 0,
          }}
        >
          {title}
        </Text>

        {description && (
          <Text
            selectable={false}
            style={{
              color: COLORS.textSecondary,
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            {description}
          </Text>
        )}
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: "rgba(255,255,255,0.14)",
            true: COLORS.primary,
          }}
          thumbColor={value ? "#FFFFFF" : "#B8B8B8"}
          ios_backgroundColor="rgba(255,255,255,0.14)"
        />
      </View>
    </View>
  );
}
