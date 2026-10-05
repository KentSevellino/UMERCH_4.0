import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export type ProfileButtonData = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type ProfileButtonProps = {
  item: ProfileButtonData;
  onPress: () => void;
};

export function ProfileButton({ item, onPress }: ProfileButtonProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 390, 0.9), 1.12);

  const styles = createStyles(scale);

  return (
    <TouchableOpacity
      style={styles.buttonCard}
      activeOpacity={0.75}
      onPress={onPress}
    >
      <View style={styles.buttonIcon}>
        <Ionicons
          name={item.icon}
          size={Math.round(30 * scale)}
          color="#B00000"
        />
      </View>

      <View style={styles.buttonTextContainer}>
        <Text style={styles.buttonTitle}>{item.title}</Text>

        <Text style={styles.buttonSubtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (scale: number) =>
  StyleSheet.create({
    buttonCard: {
      minHeight: Math.round(87 * scale),

      backgroundColor: "#FFFFFF",

      borderRadius: Math.round(18 * scale),

      paddingHorizontal: Math.round(18 * scale),

      flexDirection: "row",

      alignItems: "center",

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.035,

      shadowRadius: 5,

      elevation: 1,
    },

    buttonIcon: {
      width: Math.round(42 * scale),

      justifyContent: "center",
      alignItems: "flex-start",

      marginRight: Math.round(12 * scale),
    },

    buttonTextContainer: {
      flex: 1,

      minWidth: 0,
    },

    buttonTitle: {
      fontSize: Math.round(18 * scale),

      fontWeight: "700",

      color: "#1E293B",

      marginBottom: 4,
    },

    buttonSubtitle: {
      fontSize: Math.round(14 * scale),

      color: "#7A8494",
    },
  });
