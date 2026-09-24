import { useState } from "react";

import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Product } from "@/types/product";
import { useFavorites } from "@/context/FavoritesContext";

const { width, height } = Dimensions.get("window");

type Props = {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    size: string
  ) => void;
  onBuyNow: (
    product: Product,
    quantity: number,
    size: string
  ) => void;
};

const sizes = ["S", "M", "L", "XL", "XXL"];

const toNumber = (value: string) =>
  parseFloat(value.replace(/[^\d.]/g, "")) || 0;

export default function ProductDetailModal({
  visible,
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}: Props) {
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  const { isFavorite, toggleFavorite } = useFavorites();

  if (!product) {
    return null;
  }

  const favorite = isFavorite(product.id);

  const price = toNumber(product.price);
  const oldPrice = product.oldPrice ? toNumber(product.oldPrice) : 0;

  const discount =
    oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : null;

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      current > 1 ? current - 1 : 1
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>

        {/* Dark area above modal */}
        <TouchableOpacity
          style={styles.backgroundClose}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* ================= MODAL ================= */}

        <View style={styles.modalContainer}>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >

            {/* ================= PRODUCT IMAGE ================= */}

            <View style={styles.imageContainer}>

              <Image
                source={product.image}
                style={styles.productImage}
                resizeMode="cover"
              />

              {/* Close */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {/* Favorite */}
              <TouchableOpacity
                style={styles.favoriteButton}
                activeOpacity={0.7}
                onPress={() => toggleFavorite(product)}
              >
                <Ionicons
                  name={favorite ? "heart" : "heart-outline"}
                  size={22}
                  color={favorite ? "#FF3B3B" : "#FFFFFF"}
                />
              </TouchableOpacity>

              {/* Share */}
              <TouchableOpacity
                style={styles.shareButton}
              >
                <Ionicons
                  name="share-social-outline"
                  size={21}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              </View>

            {/* ================= PRODUCT INFORMATION ================= */}

            <View style={styles.productInfo}>

              <Text style={styles.productName}>
                {product.name}
              </Text>

              <Text style={styles.productCategory}>
                {product.category}
              </Text>

              {/* Rating */}

              <View style={styles.ratingRow}>

                <Ionicons
                  name="star"
                  size={17}
                  color="#FFB800"
                />

                <Text style={styles.rating}>
                  4.8
                </Text>

                <Text style={styles.reviews}>
                  (124 reviews)
                </Text>

              </View>

              {/* Price */}

              <View style={styles.priceRow}>

                <Text style={styles.price}>
                  ₱{price.toFixed(2)}
                </Text>


                

              </View>

              {/* ================= SIZE ================= */}

              <Text style={styles.sectionTitle}>
                Size
              </Text>

              <View style={styles.sizeContainer}>

                {sizes.map((size) => {

                  const active =
                    selectedSize === size;

                  return (
                    <TouchableOpacity
                      key={size}
                      onPress={() =>
                        setSelectedSize(size)
                      }
                      style={[
                        styles.sizeButton,
                        active &&
                          styles.sizeButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeText,
                          active &&
                            styles.sizeTextActive,
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

              </View>

              {/* ================= QUANTITY ================= */}

              <Text style={styles.sectionTitle}>
                Quantity
              </Text>

              <View style={styles.quantityContainer}>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={decreaseQuantity}
                >
                  <Ionicons
                    name="remove"
                    size={17}
                    color="#7A8494"
                  />
                </TouchableOpacity>

                <Text style={styles.quantityText}>
                  {quantity}
                </Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={increaseQuantity}
                >
                  <Ionicons
                    name="add"
                    size={17}
                    color="#7A8494"
                  />
                </TouchableOpacity>

              </View>

              {/* Bottom spacing */}
              <View style={{ height: 85 }} />

            </View>

          </ScrollView>

          {/* ================= ACTION BUTTONS ================= */}

          <View style={styles.actionContainer}>

            <TouchableOpacity
              style={styles.addToCartButton}
              activeOpacity={0.8}
              onPress={() =>
                onAddToCart(
                  product,
                  quantity,
                  selectedSize
                )
              }
            >
              <Ionicons
                name="cart-outline"
                size={18}
                color="#D60000"
              />

              <Text style={styles.addToCartText}>
                Add to Cart
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buyNowButton}
              activeOpacity={0.8}
              onPress={() =>
                onBuyNow(
                  product,
                  quantity,
                  selectedSize
                )
              }
            >
              <Ionicons
                name="cart"
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.buyNowText}>
                Buy Now
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  backgroundClose: {
    flex: 1,
  },

  modalContainer: {
    backgroundColor: "#FFFFFF",
    height: height,

    overflow: "hidden",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  /* ================= IMAGE ================= */

  imageContainer: {
    width: "100%",
    height: width * 0.92,
    backgroundColor: "#111111",
    position: "relative",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  closeButton: {
    position: "absolute",
    top: 15,
    left: 15,

    width: 36,
    height: 36,

    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",

    justifyContent: "center",
    alignItems: "center",
  },

  favoriteButton: {
    position: "absolute",
    top: 15,
    right: 57,

    width: 36,
    height: 36,

    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",

    justifyContent: "center",
    alignItems: "center",
  },

  shareButton: {
    position: "absolute",
    top: 15,
    right: 15,

    width: 36,
    height: 36,

    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",

    justifyContent: "center",
    alignItems: "center",
  },

  /* ================= INFORMATION ================= */

  productInfo: {
    paddingHorizontal: 15,
    paddingTop: 12,
  },

  productName: {
    fontSize: 35,
    fontWeight: "900",
    color: "#20242A",
  },

  productCategory: {
    fontSize: 20,
    color: "#8A929A",
    marginTop: 4,
  },

  /* ================= RATING ================= */

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  rating: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4B5563",
    marginLeft: 4,
  },

  reviews: {
    fontSize: 20,
    color: "#8A929A",
    marginLeft: 4,
  },

  /* ================= PRICE ================= */

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  price: {
    fontSize: 30,
    fontWeight: "800",
    color: "#D60000",
  },

  /* ================= SECTION ================= */

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#30363D",
    marginTop: 20,
    marginBottom: 9,
  },

  /* ================= SIZE ================= */

  sizeContainer: {
    flexDirection: "row",
    gap: 8,
  },

  sizeButton: {
    width: 45,
    height: 40,

    borderRadius: 6,

    borderWidth: 1,
    borderColor: "#E1E4E7",

    justifyContent: "center",
    alignItems: "center",
  },

  sizeButtonActive: {
    borderColor: "#D60000",
    backgroundColor: "#FFF6F6",
  },

  sizeText: {
    fontSize: 15,
    color: "#6B7280",
  },

  sizeTextActive: {
    color: "#D60000",
    fontWeight: "700",
  },

  /* ================= QUANTITY ================= */

  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",

    alignSelf: "flex-start",

    borderWidth: 1,
    borderColor: "#E1E4E7",
    borderRadius: 7,

    overflow: "hidden",
  },

  quantityButton: {
    width: 45,
    height: 40,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#F7F7F7",
  },

  quantityText: {
    width: 42,

    textAlign: "center",

    fontSize: 18,
    fontWeight: "600",
    color: "#4B5563",
  },

  /* ================= ACTION ================= */

  actionContainer: {
    position: "absolute",

    bottom: 0,
    left: 0,
    right: 0,

    height: 66,

    backgroundColor: "#FFFFFF",

    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 10,
    gap: 8,
  },

  addToCartButton: {
    flex: 1,

    height: 45,

    borderWidth: 1,
    borderColor: "#D60000",

    borderRadius: 7,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  addToCartText: {
    color: "#D60000",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 5,
  },

  buyNowButton: {
    flex: 1,

    height: 45,

    backgroundColor: "#C90000",

    borderRadius: 7,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buyNowText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 5,
  },
});