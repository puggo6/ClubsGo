// components/WebCreateModal.tsx
import isWeb from "@/constants/isWeb";
import { COLORS } from "@/constants/theme";
import { AntDesign } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
};

export const WebCreateModal = ({
  visible,
  onClose,
  title,
  children,
}: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* stop press from closing when clicking inside modal */}
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <AntDesign name="close" size={20} color={COLORS.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.divider} />
          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
export const ManagementModal = ({
  visible,
  onClose,
  title,
  children,
  width,
}: Props) => {
  return (
    <Pressable onPress={onClose}>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        {/* backdrop */}
        <View style={styles.backdrop}>
          {/* stop press from closing when clicking inside modal */}
          <View
            style={[
              styles.modal,
              width ? { width: width } : {},
              !isWeb() ? { width: "90%" } : {},
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <AntDesign
                  name="close"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </Pressable>
            </View>
            <View style={styles.divider} />
            <ScrollView
              style={styles.content}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Pressable>
  );
};
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: 560,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: "PoppinsBold",
    fontSize: 18,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceAlternate,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceAlternate,
    marginHorizontal: 0,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
