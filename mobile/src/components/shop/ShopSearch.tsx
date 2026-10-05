import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

type ShopSearchProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
  containerStyle?: object;
};

export function ShopSearch({
  value,
  onChangeText,
  placeholder = "Search products...",
  onSubmitEditing,
  containerStyle,
}: ShopSearchProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width);

  return (
    <View style={[styles.searchContainer, containerStyle]}>
      <Ionicons
        name="search-outline"
        size={Math.round(20 * scale)}
        color="#777777"
      />

      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#888888"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}

const createStyles = (scale: number, width: number) =>
  StyleSheet.create({
    searchContainer: {
      height: Math.round(46 * scale),

      marginHorizontal: Math.max(12, Math.min(width * 0.04, 14)),
      marginTop: Math.round(12 * scale),
      marginBottom: Math.round(12 * scale),

      backgroundColor: "#FFFFFF",

      borderRadius: Math.round(23 * scale),

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: Math.round(15 * scale),

      borderWidth: 1,

      borderColor: "#EDEDED",

      elevation: 1,

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 1,
      },

      shadowOpacity: 0.06,

      shadowRadius: 3,
    },

    searchInput: {
      flex: 1,

      height: "100%",

      marginLeft: Math.round(8 * scale),

      fontSize: Math.max(13, Math.round(15 * scale)),

      color: "#222222",
    },
  });
