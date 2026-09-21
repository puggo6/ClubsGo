import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import StylizedInput from "./stylizedInput";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;

  title?: string;
  description?: string;

  /**
   * Name of the thing being deleted.
   * If provided, the user must type this name to confirm.
   */
  itemName?: string;

  loading?: boolean;
};

export default function DeletionModal({
  visible,
  onClose,
  onConfirm,
  title,
  description = "This action cannot be undone.",
  itemName,
  loading = false,
}: Props) {
  const [confirmation, setConfirmation] = useState("");

  // Clear the confirmation whenever the modal closes/opens
  useEffect(() => {
    if (!visible) {
      setConfirmation("");
    }
  }, [visible]);

  const requiresConfirmation = !!itemName;

  const canDelete =
    !requiresConfirmation || confirmation.trim() === itemName?.trim();

  const handleConfirm = async () => {
    if (!canDelete || loading) return;

    await onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.65)",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              maxWidth: 450,
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              padding: 22,

              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 20,
              shadowOffset: {
                width: 0,
                height: 8,
              },
              elevation: 10,
            }}
          >
            {/* Warning icon */}
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(232, 61, 42, 0.12)",
                  marginBottom: 14,
                }}
              >
                <Ionicons
                  name="trash-outline"
                  size={32}
                  color={COLORS.privateRed}
                />
              </View>
            </View>
            {/* Title */}
            <Text
              style={{
                color: COLORS.textPrimary,
                fontFamily: "InterMedium",
                fontSize: 21,

                textAlign: "center",
              }}
            >
              {"Delete " + title + "?"}
            </Text>

            {/* Description */}
            <Text
              style={{
                color: COLORS.textSecondary,
                fontFamily: "InterRegular",
                fontSize: 14,
                lineHeight: 21,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              {description}
            </Text>

            {/* Name confirmation */}
            {itemName && (
              <View style={{ marginTop: 18 }}>
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 13,
                    marginBottom: 7,
                  }}
                >
                  Type{" "}
                  <Text
                    style={{
                      color: COLORS.textPrimary,
                      fontFamily: "InterMedium",
                    }}
                  >
                    {itemName.trim()}
                  </Text>{" "}
                  to confirm.
                </Text>

                <StylizedInput
                  value={confirmation}
                  onChangeText={setConfirmation}
                  placeholder={itemName}
                  dark={true}
                />
              </View>
            )}

            {/* Buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 10,
                marginTop: 24,
              }}
            >
              <Pressable
                onPress={onClose}
                disabled={loading}
                style={({ pressed }) => ({
                  minWidth: 110,
                  height: 42,
                  paddingHorizontal: 16,
                  borderRadius: 9,

                  alignItems: "center",
                  justifyContent: "center",

                  backgroundColor: COLORS.surfaceLight,

                  opacity: pressed || loading ? 0.6 : 1,
                })}
              >
                <Text
                  style={{
                    color: COLORS.textPrimary,
                    fontFamily: "InterMedium",
                    fontSize: 14,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirm}
                disabled={!canDelete || loading}
                style={({ pressed }) => ({
                  minWidth: 110,
                  height: 42,
                  paddingHorizontal: 16,
                  borderRadius: 9,

                  alignItems: "center",
                  justifyContent: "center",

                  backgroundColor: COLORS.deleteRed,

                  opacity: !canDelete || loading ? 0.35 : pressed ? 0.7 : 1,
                })}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text
                    style={{
                      color: COLORS.white,
                      fontFamily: "InterMedium",
                      fontSize: 14,
                    }}
                  >
                    Delete
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
