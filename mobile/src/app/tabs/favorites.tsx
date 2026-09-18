import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FavoritesHeader from "@/components/navigation/favorites/FavoritesHeader";
import { ShopProductCard } from "@/components/navigation/shop/ShopProductCard";
import ProductDetailModal from "@/components/product/ProductDetailModal";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import { TabContent } from "@/components/tab-content";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/product";

export default function Favorites() {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 390, 0.9), 1.12);

  const styles = createStyles(scale, width);

  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { addItem } = useCart();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalVisible, setProductModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        <FavoritesHeader scale={scale} />

        <TabContent>
          {favorites.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="heart-outline"
                size={Math.round(64 * scale)}
                color="#D5D5D5"
              />
              <Text style={styles.emptyTitle}>No favorites yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the heart on products you love.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.productsGrid}>
                {favorites.map((product) => (
                  <ShopProductCard
                    key={product.id}
                    product={product}
                    isFavorite={isFavorite(product.id)}
                    onFavorite={() => toggleFavorite(product)}
                    onPress={() => {
                      setSelectedProduct(product);
                      setProductModalVisible(true);
                    }}
                  />
                ))}
              </View>

              <View style={{ height: 100 }} />
            </ScrollView>
          )}
        </TabContent>

        <BottomNavbar activeTab="favorites" />

        <ProductDetailModal
          key={selectedProduct?.id ?? "none"}
          visible={productModalVisible}
          product={selectedProduct}
          onClose={() => {
            setProductModalVisible(false);
            setSelectedProduct(null);
          }}
          onAddToCart={(product, quantity, size) => {
            addItem(product, quantity);
            setProductModalVisible(false);
          }}
          onBuyNow={(product, quantity, size) => {
            console.log("BUY NOW", {
              product: product.name,
              quantity,
              size,
            });
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (scale: number, width: number) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F7F7F7" },
    screen: { flex: 1, backgroundColor: "#F7F7F7" },

    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 30,
      paddingBottom: Math.round(40 * scale),
    },

    emptyTitle: {
      fontSize: Math.round(19 * scale),
      fontWeight: "800",
      color: "#1E293B",
      marginTop: Math.round(16 * scale),
    },

    emptySubtitle: {
      fontSize: Math.round(14 * scale),
      color: "#7A8494",
      marginTop: 6,
      textAlign: "center",
    },

    scrollView: {
      flex: 1,
    },

    content: {
      paddingBottom: 20,
    },

    productsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Math.round(10 * scale),
      paddingHorizontal: Math.max(12, Math.min(width * 0.04, 14)),
      paddingTop: Math.round(10 * scale),
    },
  });