import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

type ShopCategoriesProps = {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
};

export function ShopCategories({
  categories,
  selected,
  onSelect,
}: ShopCategoriesProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {categories.map((category) => {
        const active = selected === category;

        return (
          <TouchableOpacity
            key={category}
            style={[styles.chip, active && styles.chipActive]}
            activeOpacity={0.7}
            onPress={() => {
              onSelect(category);
            }}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {category}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (scale: number, width: number) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",

      gap: Math.round(8 * scale),

      paddingHorizontal: Math.max(12, Math.min(width * 0.04, 14)),

      paddingTop: Math.round(12 * scale),

      paddingBottom: Math.round(4 * scale),
    },

    chip: {
      height: Math.round(34 * scale),

      paddingHorizontal: Math.round(15 * scale),

      borderRadius: Math.round(17 * scale),

      backgroundColor: "#FFFFFF",

      borderWidth: 1,

      borderColor: "#E6E6E6",

      justifyContent: "center",
      alignItems: "center",
    },

    chipActive: {
      backgroundColor: "#B00000",

      borderColor: "#B00000",
    },

    chipText: {
      color: "#555555",

      fontSize: Math.max(12, Math.round(13 * scale)),

      fontWeight: "600",
    },

    chipTextActive: {
      color: "#FFFFFF",

      fontWeight: "700",
    },
  });
