import { StyleSheet, Text, TouchableOpacity, useWindowDimensions } from "react-native";

type GoogleButtonProps = {
  onPress: () => void;
};

export function GoogleButton({ onPress }: GoogleButtonProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale);

  return (
    <TouchableOpacity style={styles.googleButton} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.googleLogo}>G</Text>

      <Text style={styles.googleText}>Continue with Google</Text>
    </TouchableOpacity>
  );
}

const createStyles = (scale: number) =>
  StyleSheet.create({
    googleButton: {
      height: Math.round(50 * scale),

      backgroundColor: "#EDEDED",

      borderRadius: Math.round(26 * scale),

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.18,
      shadowRadius: 3,

      elevation: 3,
    },

    googleLogo: {
      fontSize: Math.round(17 * scale),

      fontWeight: "800",

      color: "#4285F4",

      marginRight: Math.round(8 * scale),
    },

    googleText: {
      fontSize: Math.round(14 * scale),

      fontWeight: "700",

      color: "#222222",
    },
  });