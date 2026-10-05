import { useEffect, useState } from "react";

import { useFavorites } from "@/context/FavoritesContext";
import type { Product } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const VARIANT_OPTIONS: Record<string, string[]> = {
  size: ["XS", "S", "M", "L", "XL"],
  mug: ["One size"],
  tumbler: ["12oz", "16oz", "20oz", "24oz"],
  notebook: ["30 pages", "50 pages", "100 pages"],
  umbrella: ["One size"],
  totebag: ["One size"],
};

type Props = {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size: string) => void;
  onBuyNow: (product: Product, quantity: number, size: string) => void;
};

const toNumber = (value: string) =>
  parseFloat(value.replace(/[^\d.]/g, "")) || 0;

export default function ProductDetailModal({
  visible,
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}: Props) {
  const variants = product?.variants ?? [];
  const rawVariantType = product?.variantType?.trim().toLowerCase() ?? "";
  const variantType = rawVariantType.includes("size") ? "size" : rawVariantType;
  const isSizeVariant = product?.hasSize === true || variantType === "size";
  const configuredVariants = VARIANT_OPTIONS[variantType] ?? [];
  const displayVariants =
    configuredVariants.length > 0
      ? configuredVariants
      : variants.length > 0
        ? variants
        : product?.variant
          ? [product.variant]
          : [];
  const [selectedVariant, setSelectedVariant] = useState(
    displayVariants[0] ?? product?.variant ?? "",
  );
  const [quantity, setQuantity] = useState(1);

  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    setSelectedVariant(displayVariants[0] ?? product?.variant ?? "");
    setQuantity(1);
  }, [product?.id, displayVariants.join("|")]);

  if (!product) {
    return null;
  }

  const favorite = isFavorite(product.id);

  const price = toNumber(product.price);
  const oldPrice = product.oldPrice ? toNumber(product.oldPrice) : 0;

  const discount =
    oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : null;

  const decreaseQuantity = () => {
    setQuantity((current) => (current > 1 ? current - 1 : 1));
  };

  const selectedStock =
    displayVariants.length > 0
      ? (product.variantStocks?.[selectedVariant.trim()] ?? 0)
      : (product.variantStocks?.[selectedVariant.trim()] ?? product.stock ?? 0);
  const isOutOfStock = selectedStock < 1;
  const canPurchase = !isOutOfStock && quantity <= selectedStock;

  const increaseQuantity = () => {
    setQuantity((current) =>
      selectedStock > 0 ? Math.min(current + 1, selectedStock) : current,
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
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={23} color="#FFFFFF" />
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
              <TouchableOpacity style={styles.shareButton}>
                <Ionicons
                  name="share-social-outline"
                  size={21}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            {/* ================= PRODUCT INFORMATION ================= */}

            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>

              <Text style={styles.productCategory}>{product.category}</Text>

              {/* Rating */}

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={17} color="#FFB800" />

                <Text style={styles.rating}>4.8</Text>

                <Text style={styles.reviews}>(124 reviews)</Text>
              </View>

              {/* Price */}

              <View style={styles.priceRow}>
                <Text style={styles.price}>₱{price.toFixed(2)}</Text>
              </View>

              {/* ================= ADMIN-ASSIGNED VARIETY ================= */}

              {displayVariants.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>
                    {isSizeVariant ? "Size" : product.variantType || "Variety"}
                  </Text>

                  <View style={styles.sizeContainer}>
                    {displayVariants.map((variant) => {
                      const variantStock =
                        product.variantStocks?.[variant.trim()] ?? 0;
                      const active = selectedVariant === variant;

                      return (
                        <TouchableOpacity
                          key={variant}
                          onPress={() => {
                            setSelectedVariant(variant);
                            setQuantity(1);
                          }}
                          disabled={variantStock < 1}
                          style={[
                            styles.sizeButton,
                            active && styles.sizeButtonActive,
                            variantStock < 1 && styles.sizeButtonDisabled,
                          ]}
                        >
                          <Text
                            style={[
                              styles.sizeText,
                              active && styles.sizeTextActive,
                              variantStock < 1 && styles.sizeTextDisabled,
                            ]}
                          >
                            {variant}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {/* ================= QUANTITY ================= */}

              <Text style={styles.sectionTitle}>Quantity</Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={decreaseQuantity}
                >
                  <Ionicons name="remove" size={17} color="#7A8494" />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={increaseQuantity}
                >
                  <Ionicons name="add" size={17} color="#7A8494" />
                </TouchableOpacity>
              </View>

              <Text
                style={
                  isOutOfStock ? styles.stockUnavailable : styles.stockAvailable
                }
              >
                {isOutOfStock ? "Out of stock" : `${selectedStock} available`}
              </Text>

              {/* Bottom spacing */}
              <View style={{ height: 85 }} />
            </View>
          </ScrollView>

          {/* ================= ACTION BUTTONS ================= */}

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                !canPurchase && styles.addToCartDisabled,
              ]}
              activeOpacity={0.8}
              onPress={() => onAddToCart(product, quantity, selectedVariant)}
              disabled={!canPurchase}
            >
              <Ionicons
                name="cart-outline"
                size={18}
                color={canPurchase ? "#D60000" : "#D4878C"}
              />

              <Text
                style={[
                  styles.addToCartText,
                  !canPurchase && styles.addToCartTextDisabled,
                ]}
              >
                Add to Cart
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buyNowButton,
                !canPurchase && styles.buyNowDisabled,
              ]}
              activeOpacity={0.8}
              onPress={() => onBuyNow(product, quantity, selectedVariant)}
              disabled={!canPurchase}
            >
              <Ionicons name="cart" size={17} color="#FFFFFF" />

              <Text style={styles.buyNowText}>Buy Now</Text>
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
    minWidth: 45,
    paddingHorizontal: 10,
    height: 40,

    borderRadius: 6,

    borderWidth: 1,
    borderColor: "#E1E4E7",

    justifyContent: "center",
    alignItems: "center",
  },

  sizeButtonActive: {
    borderColor: "#D60000",
    borderWidth: 2,

    backgroundColor: "#FDE7E7",
  },

  sizeButtonDisabled: {
    backgroundColor: "#F2F2F2",
    borderColor: "#E1E1E1",
    opacity: 0.6,
  },

  sizeText: {
    fontSize: 15,
    color: "#6B7280",
  },

  sizeTextActive: {
    color: "#D60000",
    fontWeight: "700",
  },

  sizeTextDisabled: {
    color: "#A0A0A0",
    textDecorationLine: "line-through",
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

  stockAvailable: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 8,
  },

  stockUnavailable: {
    color: "#B00000",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
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

  addToCartTextDisabled: {
    color: "#D4878C",
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

  addToCartDisabled: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D4878C",
  },

  buyNowDisabled: {
    backgroundColor: "#D4878C",
    borderColor: "#D4878C",
  },

  buyNowText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 5,
  },
});
