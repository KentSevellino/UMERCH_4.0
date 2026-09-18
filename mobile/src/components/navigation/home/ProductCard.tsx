import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import type { Product } from "@/types/product";
import { useFavorites } from "@/context/FavoritesContext";

type ProductCardProps = {
  product: Product;
  index: number;
  grid?: boolean;
  onPress?: () => void;
};

export function ProductCard({
  product,
  index,
  grid = false,
  onPress,
}: ProductCardProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width);

  const { isFavorite, toggleFavorite } = useFavorites();

  const favorite = isFavorite(product.id);

  return (
    <TouchableOpacity
      style={[styles.productCard, grid && styles.productCardGrid]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Product image */}

      <View
        style={[
          styles.productImageContainer,
          grid && styles.productImageContainerGrid,
        ]}
      >
        <Image
          source={product.image}
          style={styles.productImage}
          resizeMode="cover"
        />

        {/* New badge */}

        {index < 2 && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>New</Text>
          </View>
        )}

        {/* Favorite */}

        <TouchableOpacity
          style={styles.productHeart}
          activeOpacity={0.7}
          onPress={() => toggleFavorite(product)}
        >
          <Ionicons
            name={favorite ? "heart" : "heart-outline"}
            size={Math.round(18 * scale)}
            color={favorite ? "#D60000" : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>

      {/* Product information */}

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>

        <Text style={styles.productCategory} numberOfLines={1}>
          {product.category}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{product.price}</Text>

          <Text style={styles.oldPrice}>{product.oldPrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (scale: number, width: number) => {
  const contentPadding = Math.max(12, Math.min(width * 0.04, 14));

  const gridGap = Math.round(10 * scale);

  const gridCardWidth = (width - contentPadding * 2 - gridGap) / 2;

  return StyleSheet.create({
    productCard: {
      width: Math.min(width * 0.29, 132),

      backgroundColor: "#FFFFFF",

      borderRadius: Math.round(11 * scale),

      overflow: "hidden",

      elevation: 1,

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 1,
      },

      shadowOpacity: 0.08,

      shadowRadius: 3,
    },

    productCardGrid: {
      width: gridCardWidth,
    },

    productImageContainer: {
      height: Math.min(width * 0.27, 118),

      position: "relative",

      backgroundColor: "#222222",
    },

    productImageContainerGrid: {
      height: Math.round(gridCardWidth * 0.9),
    },

    productImage: {
      width: "100%",
      height: "100%",
    },

    newBadge: {
      position: "absolute",

      top: Math.round(7 * scale),
      left: Math.round(7 * scale),

      backgroundColor: "#E21B1B",

      borderRadius: Math.round(7 * scale),

      paddingHorizontal: Math.round(6 * scale),
      paddingVertical: Math.round(3 * scale),
    },

    newBadgeText: {
      color: "#FFFFFF",

      fontSize: Math.max(8, Math.round(8 * scale)),

      fontWeight: "700",
    },

    productHeart: {
      position: "absolute",

      top: Math.round(6 * scale),
      right: Math.round(6 * scale),

      width: Math.round(24 * scale),
      height: Math.round(24 * scale),

      borderRadius: Math.round(12 * scale),

      backgroundColor: "rgba(0,0,0,0.35)",

      justifyContent: "center",
      alignItems: "center",
    },

    productInfo: {
      paddingHorizontal: Math.round(7 * scale),

      paddingTop: Math.round(6 * scale),

      paddingBottom: Math.round(8 * scale),
    },

    productName: {
      color: "#333333",

      fontSize: Math.max(14, Math.round(14 * scale)),

      fontWeight: "700",
    },

    productCategory: {
      color: "#888888",

      fontSize: Math.max(11, Math.round(11 * scale)),

      marginTop: Math.round(2 * scale),
    },

    priceRow: {
      flexDirection: "row",

      alignItems: "center",

      marginTop: Math.round(4 * scale),

      gap: Math.round(5 * scale),

      flexWrap: "wrap",
    },

    productPrice: {
      color: "#B00000",

      fontSize: Math.max(14, Math.round(15 * scale)),

      fontWeight: "800",
    },

    oldPrice: {
      color: "#A5A5A5",

      fontSize: Math.max(11, Math.round(11 * scale)),

      textDecorationLine: "line-through",
    },
  });
};
