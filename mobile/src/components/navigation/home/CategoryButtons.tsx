import { StyleSheet, Text, TouchableOpacity, useWindowDimensions } from "react-native";

type CategoryButtonsProps = {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
};

export function CategoryButtons({
  categories,
  selected,
  onSelect,
}: CategoryButtonsProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale);

  return (
    <>
      {categories.map((category) => {
        const active = selected === category;

        return (
          <TouchableOpacity
            key={category}
            style={[styles.filterChip, active && styles.filterChipActive]}
            activeOpacity={0.7}
            onPress={() => {
              onSelect(category);
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                active && styles.filterChipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        );
      })}
    </>
  );
}

const createStyles = (scale: number) =>
  StyleSheet.create({
    filterChip: {
      height: Math.round(32 * scale),

      paddingHorizontal: Math.round(14 * scale),

      borderRadius: Math.round(16 * scale),

      backgroundColor: "#FFFFFF",

      borderWidth: 1,

      borderColor: "#E0E0E0",

      justifyContent: "center",
      alignItems: "center",
    },

    filterChipActive: {
      backgroundColor: "#B00000",

      borderColor: "#B00000",
    },

    filterChipText: {
      color: "#555555",

      fontSize: Math.max(12, Math.round(13 * scale)),

      fontWeight: "600",
    },

    filterChipTextActive: {
      color: "#FFFFFF",

      fontWeight: "700",
    },
  });
