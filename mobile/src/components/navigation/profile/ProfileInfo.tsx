import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

type ProfileInfoProps = {
  name: string;
  role: string;
  university: string;
  onPress?: () => void;
};

export function ProfileInfo({
  name,
  role,
  university,
  onPress,
}: ProfileInfoProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 390, 0.9), 1.12);

  const styles = createStyles(scale);

  return (
    <TouchableOpacity style={styles.profileCard} activeOpacity={0.85} onPress={onPress}>
      {/* Avatar */}

      <View style={styles.avatar}>
        <Ionicons name="person" size={Math.round(52 * scale)} color="#FFFFFF" />
      </View>

      {/* User information */}

      <View style={styles.userInformation}>
        <Text style={styles.userName}>Hi, {name}</Text>

        <Text style={styles.userRole}>{role}</Text>

        <View style={styles.universityRow}>
          <Ionicons
            name="school-outline"
            size={Math.round(19 * scale)}
            color="#1E293B"
          />

          <Text style={styles.universityText}>{university}</Text>
        </View>
      </View>

      {/* Arrow */}

      <Ionicons
        name="chevron-forward"
        size={Math.round(25 * scale)}
        color="#7A8494"
      />
    </TouchableOpacity>
  );
}

const createStyles = (scale: number) =>
  StyleSheet.create({
    profileCard: {
      backgroundColor: "#FFFFFF",

      borderRadius: Math.round(24 * scale),

      paddingHorizontal: Math.round(20 * scale),

      paddingTop: Math.round(22 * scale),

      paddingBottom: Math.round(17 * scale),

      flexDirection: "row",

      flexWrap: "wrap",

      alignItems: "center",

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.06,

      shadowRadius: 7,

      elevation: 2,
    },

    avatar: {
      width: Math.round(88 * scale),
      height: Math.round(88 * scale),

      borderRadius: Math.round(44 * scale),

      backgroundColor: "#BD5555",

      justifyContent: "center",
      alignItems: "center",

      marginRight: Math.round(17 * scale),
    },

    userInformation: {
      flex: 1,

      minWidth: 0,
    },

    userName: {
      fontSize: Math.round(25 * scale),

      fontWeight: "800",

      color: "#1E293B",

      marginBottom: 5,
    },

    userRole: {
      fontSize: Math.round(14 * scale),

      fontWeight: "500",

      color: "#7A8494",

      marginBottom: 6,
    },

    universityRow: {
      flexDirection: "row",

      alignItems: "center",
    },

    universityText: {
      fontSize: Math.round(13 * scale),

      color: "#667085",

      marginLeft: 7,

      flexShrink: 1,
    },
  });