import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Switch, Text, View } from "react-native";

type OverrideInfo = {
  /** "overridden": this setting's value is forced/ignored because of a parent setting.
   *  "overrides": this setting, when on, forces a related child setting regardless of its own value. */
  type: "overridden" | "overrides";
  /** Short explanation, e.g. "Forced on by school setting" or "Overrides club approval settings" */
  label: string;
};

type SchoolSettingProps = {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  overrideLabel?: string;
};

export default function SchoolSetting({
  title,
  description,
  value,
  onValueChange,
  disabled = false,
  overrideLabel,
}: SchoolSettingProps) {
  const isOverridden = !!overrideLabel;

  return (
    <View
      style={{
        flexDirection: "row",
        width: "100%",
        borderRadius: 14,
        paddingTop: 15,
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: description || overrideLabel ? 4 : 0,
          }}
        >
          <Text
            selectable={false}
            style={{
              color: COLORS.textPrimary,
              fontSize: 15,
              fontFamily: "InterSemiBold",
            }}
          >
            {title}
          </Text>

          {overrideLabel && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 8,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 20,
                gap: 4,
                backgroundColor: isOverridden
                  ? "rgba(255,255,255,0.08)"
                  : `${COLORS.primary}22`,
              }}
            >
              <Ionicons
                name={isOverridden ? "lock-closed" : "arrow-down-circle"}
                size={11}
                color={isOverridden ? COLORS.textMuted : COLORS.primary}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "InterMedium",
                  color: isOverridden ? COLORS.textMuted : COLORS.primary,
                }}
              >
                {isOverridden ? "Overridden" : "Overrides"}
              </Text>
            </View>
          )}
        </View>

        {description && (
          <Text
            selectable={false}
            style={{
              color: COLORS.textSecondary,
              fontSize: 13,
              lineHeight: 18,
              fontFamily: "InterRegular",
            }}
          >
            {description}
          </Text>
        )}

        {overrideLabel && (
          <Text
            selectable={false}
            style={{
              color: isOverridden ? COLORS.textMuted : COLORS.primary,
              fontSize: 12,
              lineHeight: 16,
              fontFamily: "InterRegular",
              marginTop: 3,
              fontStyle: isOverridden ? "italic" : "normal",
            }}
          >
            {overrideLabel}
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
export function SettingsHeader({ title }: { title: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontFamily: "PoppinsMedium",
          color: COLORS.textSecondary,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: COLORS.surfaceLight,
          marginLeft: 10,
        }}
      />
    </View>
  );
}
