import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

type CartQuantityProps = {
  quantity: number;
  onChange: (quantity: number) => void;
};

export function CartQuantity({ quantity, onChange }: CartQuantityProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale);

  return (
    <TouchableOpacity style={styles.stepper} activeOpacity={0.85}>
      <TouchableOpacity
        style={styles.stepButton}
        activeOpacity={0.7}
        onPress={() => {
          onChange(Math.max(1, quantity - 1));
        }}
      >
        <Ionicons name="remove" size={Math.round(16 * scale)} color="#555555" />
      </TouchableOpacity>

      <Text style={styles.count}>{quantity}</Text>

      <TouchableOpacity
        style={styles.stepButton}
        activeOpacity={0.7}
        onPress={() => {
          onChange(quantity + 1);
        }}
      >
        <Ionicons name="add" size={Math.round(16 * scale)} color="#B00000" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const createStyles = (scale: number) =>
  StyleSheet.create({
    stepper: {
      height: Math.round(30 * scale),

      borderRadius: Math.round(15 * scale),

      backgroundColor: "#F3F3F3",

      flexDirection: "row",

      alignItems: "center",

      overflow: "hidden",
    },

    stepButton: {
      width: Math.round(30 * scale),
      height: "100%",

      justifyContent: "center",
      alignItems: "center",
    },

    count: {
      minWidth: Math.round(26 * scale),

      textAlign: "center",

      color: "#222222",

      fontSize: Math.max(13, Math.round(14 * scale)),

      fontWeight: "700",
    },
  });