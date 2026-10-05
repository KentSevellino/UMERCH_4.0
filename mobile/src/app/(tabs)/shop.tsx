import { TabContent } from "@/components/common/TabContent";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import ProductDetailModal from "@/components/product/ProductDetailModal";
import { ShopCategories } from "@/components/shop/ShopCategories";
import ShopHeader from "@/components/shop/ShopHeader";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { ShopSearch } from "@/components/shop/ShopSearch";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";
import { router } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/*
|--------------------------------------------------------------------------
| PRODUCTS
|--------------------------------------------------------------------------
*/

const CATEGORIES = ["All", "Jersey", "Bags", "Drinkware", "School Supplies"];

/*
|--------------------------------------------------------------------------
| SHOP SCREEN
|--------------------------------------------------------------------------
*/

export default function Shop() {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width);

  const { addItem } = useCart();

  const { isFavorite, toggleFavorite } = useFavorites();
  const { products, isLoading, error } = useProducts();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalVisible, setProductModalVisible] = useState(false);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const matchesQuery = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesQuery;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        <ShopHeader scale={scale} />

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <TabContent>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {isLoading && (
              <Text style={styles.statusText}>Loading products...</Text>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}

            <ShopSearch value={searchQuery} onChangeText={setSearchQuery} />

            <ShopCategories
              categories={CATEGORIES}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />

            <View style={styles.productsGrid}>
              {filteredProducts.map((product) => (
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
        </TabContent>

        {/* =====================================================
            BOTTOM NAVIGATION
        ====================================================== */}

        <BottomNavbar activeTab="shop" />

        <ProductDetailModal
          key={selectedProduct?.id ?? "none"}
          visible={productModalVisible}
          product={selectedProduct}
          onClose={() => {
            setProductModalVisible(false);
            setSelectedProduct(null);
          }}
          onAddToCart={(product, quantity, size) => {
            addItem(product, quantity, size);
            setProductModalVisible(false);
          }}
          onBuyNow={async (product, quantity, size) => {
            await addItem(product, quantity, size);
            setProductModalVisible(false);
            setSelectedProduct(null);
            router.push("/checkout");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const createStyles = (scale: number, width: number) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#F5F5F5",
    },

    screen: {
      flex: 1,
      backgroundColor: "#F5F5F5",
    },

    content: {
      paddingBottom: 20,
    },

    statusText: {
      paddingVertical: 12,
      color: "#666666",
      textAlign: "center",
    },

    errorText: {
      paddingVertical: 12,
      color: "#B00000",
      textAlign: "center",
    },

    productsGrid: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: Math.round(10 * scale),

      paddingHorizontal: Math.max(12, Math.min(width * 0.04, 14)),

      paddingTop: Math.round(8 * scale),
    },
  });
