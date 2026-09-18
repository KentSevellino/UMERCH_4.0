import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

type LogoutButtonProps = {
  onPress: () => void;
};

export function LogoutButton({ onPress }: LogoutButtonProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 390, 0.9), 1.12);

  const styles = createStyles(scale);

  return (
    <TouchableOpacity
      style={styles.logoutButton}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Ionicons
        name="log-out-outline"
        size={Math.round(25 * scale)}
        color="#B00000"
      />

      <Text style={styles.logoutText}>Log Out</Text>
    </TouchableOpacity>
  );
}

const createStyles = (scale: number) =>
  StyleSheet.create({
    logoutButton: {
      height: Math.round(64 * scale),

      marginTop: Math.round(22 * scale),

      marginHorizontal: Math.round(7 * scale),

      paddingHorizontal: Math.round(25 * scale),

      backgroundColor: "#FFF7F7",

      borderRadius: Math.round(16 * scale),

      flexDirection: "row",

      alignItems: "center",
    },

    logoutText: {
      fontSize: Math.round(16 * scale),

      fontWeight: "700",

      color: "#B00000",

      marginLeft: Math.round(17 * scale),
    },
  });