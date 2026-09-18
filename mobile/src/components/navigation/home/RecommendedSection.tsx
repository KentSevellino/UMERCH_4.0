import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { CategoryButtons } from "@/components/navigation/home/CategoryButtons";
import { ProductCard } from "@/components/navigation/home/ProductCard";
import type { Product } from "@/types/product";

type RecommendedSectionProps = {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSeeAll: () => void;
  products: Product[];
  onProductPress?: (product: Product) => void;
};

export function RecommendedSection({
  categories,
  selectedCategory,
  onSelectCategory,
  onSeeAll,
  products,
  onProductPress,
}: RecommendedSectionProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale);

  return (
    <>
      {/* Section header */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
        </View>

        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All →</Text>
        </TouchableOpacity>
      </View>

      {/* Category filter */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <CategoryButtons
          categories={categories}
          selected={selectedCategory}
          onSelect={onSelectCategory}
        />
      </ScrollView>

      {/* Product grid */}

      <View style={styles.productsGrid}>
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            grid
            onPress={() => onProductPress?.(product)}
          />
        ))}
      </View>
    </>
  );
}

const createStyles = (scale: number) =>
  StyleSheet.create({
    sectionHeader: {
      flexDirection: "row",

      justifyContent: "space-between",

      alignItems: "center",

      marginTop: Math.round(15 * scale),

      marginBottom: Math.round(9 * scale),
    },

    sectionTitleContainer: {
      flexDirection: "row",

      alignItems: "center",
    },

    sectionTitle: {
      color: "#242424",

      fontSize: Math.max(19, Math.round(20 * scale)),

      fontWeight: "800",
    },

    seeAll: {
      color: "#B00000",

      fontSize: Math.max(12, Math.round(12 * scale)),

      fontWeight: "700",
    },

    filterRow: {
      flexDirection: "row",

      gap: Math.round(8 * scale),

      paddingBottom: Math.round(11 * scale),
    },

    productsGrid: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: Math.round(10 * scale),

      paddingBottom: 4,
    },
  });
