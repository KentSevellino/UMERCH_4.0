import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

type CheckoutButtonProps = {
  onPress: () => void;
};

export function CheckoutButton({ onPress }: CheckoutButtonProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width);

  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={styles.text}>Check Out</Text>

      <Ionicons
        name="arrow-forward"
        size={Math.round(18 * scale)}
        color="#FFFFFF"
      />
    </TouchableOpacity>
  );
}

const createStyles = (scale: number, width: number) =>
  StyleSheet.create({
    button: {
      height: Math.round(52 * scale),

      marginHorizontal: Math.max(12, Math.min(width * 0.04, 14)),

      marginTop: Math.round(14 * scale),
      marginBottom: Math.round(10 * scale),

      borderRadius: Math.round(26 * scale),

      backgroundColor: "#B00000",

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: Math.round(8 * scale),

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.22,

      shadowRadius: 4,

      elevation: 4,
    },

    text: {
      color: "#FFFFFF",

      fontSize: Math.max(15, Math.round(16 * scale)),

      fontWeight: "800",
    },
  });