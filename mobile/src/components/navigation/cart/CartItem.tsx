import { CartQuantity } from "@/components/navigation/cart/CartQuantity";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import type { ImageSourcePropType } from "react-native";

export type CartItemData = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: ImageSourcePropType;
  quantity: number;
};

type CartItemProps = {
  item: CartItemData;
  onChangeQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
};

export function CartItem({ item, onChangeQuantity, onRemove }: CartItemProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width);

  return (
    <View style={styles.card}>
      {/* Product image */}

      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      </View>

      {/* Product information */}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.category} numberOfLines={1}>
          {item.category}
        </Text>

        <Text style={styles.price}>₱{item.price.toFixed(2)}</Text>

        <View style={styles.bottomRow}>
          <CartQuantity
            quantity={item.quantity}
            onChange={(quantity) => {
              onChangeQuantity(item.id, quantity);
            }}
          />

          <TouchableOpacity
            style={styles.removeButton}
            activeOpacity={0.7}
            onPress={() => {
              onRemove(item.id);
            }}
          >
            <Ionicons
              name="trash-outline"
              size={Math.round(18 * scale)}
              color="#B00000"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (scale: number, width: number) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",

      backgroundColor: "#FFFFFF",

      borderRadius: Math.round(14 * scale),

      padding: Math.round(10 * scale),

      elevation: 1,

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 1,
      },

      shadowOpacity: 0.07,

      shadowRadius: 3,
    },

    imageContainer: {
      width: Math.round(84 * scale),
      height: Math.round(84 * scale),

      borderRadius: Math.round(10 * scale),

      overflow: "hidden",

      backgroundColor: "#222222",
    },

    image: {
      width: "100%",
      height: "100%",
    },

    info: {
      flex: 1,

      minWidth: 0,

      marginLeft: Math.round(12 * scale),
    },

    name: {
      color: "#333333",

      fontSize: Math.max(14, Math.round(15 * scale)),

      fontWeight: "700",
    },

    category: {
      color: "#888888",

      fontSize: Math.max(11, Math.round(12 * scale)),

      marginTop: Math.round(1 * scale),
    },

    price: {
      color: "#B00000",

      fontSize: Math.max(14, Math.round(15 * scale)),

      fontWeight: "800",

      marginTop: Math.round(3 * scale),
    },

    bottomRow: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent: "space-between",

      marginTop: Math.round(8 * scale),
    },

    removeButton: {
      width: Math.round(30 * scale),
      height: Math.round(30 * scale),

      justifyContent: "center",
      alignItems: "center",
    },
  });