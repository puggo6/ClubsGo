import { COLORS } from "@/constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

type defProps = {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
  restricted?: boolean;
  fixSpacing?: boolean;
};
type sizeProps = {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
  width: number;
  height: number;
  horizontalPadding?: number;
  restricted?: boolean;
};

type pairProps = {
  onPress: (() => void)[];
  buttonTitles: string[];
  disabled?: boolean;
  buttonWidth: number;
  fixSpacing?: boolean;
  buttonTypes: number[];
};

export default function GradientButton({
  onPress,
  title,
  disabled = false,
  restricted,
  fixSpacing,
}: defProps) {
  return (
    <View style={styles.outerButton}>
      <LinearGradient
        colors={
          restricted
            ? ["#4B4B4B", "#7C7C7C"]
            : ["#f64f59", "#c471ed", "#12c2e9"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientBorder, disabled && styles.disabledBorder]}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Text style={styles.text}>{title}</Text>
        </Pressable>
      </LinearGradient>
      {!fixSpacing && <View style={{ paddingBottom: 60 }} />}
    </View>
  );
}

export function MonochromeButton({
  onPress,
  title,
  disabled = false,
  restricted,
}: defProps) {
  return (
    <View style={styles.outerButton}>
      <View
        style={[
          styles.gradientBorder,
          disabled && styles.disabledBorder,
          { backgroundColor: COLORS.textSecondary },
        ]}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Text style={styles.text}>{title}</Text>
        </Pressable>
      </View>
      <View style={{ paddingBottom: 60 }} />
    </View>
  );
}
export function LargeMonochromeButton({
  onPress,
  title,
  disabled = false,
  restricted,
}: defProps) {
  return (
    <View style={{ width: "75%" }}>
      <View
        style={[
          styles.largeBorder,
          disabled && styles.disabledBorder,
          { backgroundColor: COLORS.textSecondary },
        ]}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            disabled && styles.disabled,
            { borderRadius: 100 },
          ]}
        >
          <Text style={styles.text}>{title}</Text>
        </Pressable>
      </View>
      <View style={{ paddingBottom: 60 }} />
    </View>
  );
}
export function SizeGradientButton({
  onPress,
  title,
  width,
  height,
  horizontalPadding,
  disabled = false,
  restricted,
}: sizeProps) {
  return (
    <View
      style={[!horizontalPadding && { paddingHorizontal: horizontalPadding }]}
    >
      <LinearGradient
        colors={
          restricted
            ? ["#4B4B4B", "#7C7C7C"]
            : ["#f64f59", "#c471ed", "#12c2e9"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientBorder, disabled && styles.disabledBorder]}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            disabled && styles.disabled,
            { paddingVertical: height, paddingHorizontal: width },
          ]}
        >
          <Text style={[styles.text]}>{title}</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

export function ButtonPair({
  buttonTitles,
  onPress,
  disabled = false,
  fixSpacing,
  buttonWidth,
  buttonTypes, //0=gradient, 1=monochrome, 2=red
}: pairProps) {
  return (
    <View
      style={{
        width: "100%",

        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FlatList
        data={buttonTitles}
        horizontal
        renderItem={(item) => {
          return (
            <View style={{ width: buttonWidth, marginHorizontal: 20 }}>
              {buttonTypes[item.index] !== 0 ? (
                <View
                  style={[
                    styles.gradientBorder,
                    disabled && styles.disabledBorder,
                    buttonTypes[item.index] === 1 && {
                      backgroundColor: COLORS.textSecondary,
                    },
                    buttonTypes[item.index] === 2 && {
                      borderColor: "red",
                    },
                  ]}
                >
                  <Pressable
                    onPress={onPress[item.index]}
                    disabled={disabled}
                    style={({ pressed }) => [
                      styles.button,
                      pressed && styles.pressed,
                      disabled && styles.disabled,
                      buttonTypes[item.index] === 2 && {
                        backgroundColor: COLORS.deleteRed,
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",

                        alignItems: "center",
                      }}
                    >
                      {buttonTypes[item.index] === 2 && (
                        <View style={{ position: "absolute", left: -30 }}>
                          <FontAwesome
                            name="trash-o"
                            size={24}
                            color={COLORS.textPrimary}
                          />
                        </View>
                      )}
                      <Text style={styles.text}>{item.item}</Text>
                    </View>
                  </Pressable>
                </View>
              ) : (
                <LinearGradient
                  colors={["#f64f59", "#c471ed", "#12c2e9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.gradientBorder,
                    disabled && styles.disabledBorder,
                  ]}
                >
                  <Pressable
                    onPress={onPress[item.index]}
                    disabled={disabled}
                    style={({ pressed }) => [
                      styles.button,
                      pressed && styles.pressed,
                      disabled && styles.disabled,
                    ]}
                  >
                    <Text style={styles.text}>{item.item}</Text>
                  </Pressable>
                </LinearGradient>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: 16,
    padding: 2,
    marginVertical: 10,
  },
  largeBorder: {
    borderRadius: 100,
    padding: 2,
    marginVertical: 10,
  },
  button: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  disabledBorder: {
    opacity: 0.3,
  },
  disabled: {
    backgroundColor: "#222222",
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: "InterSemiBold",
  },
  outerButton: {
    paddingHorizontal: 60,
  },
});
