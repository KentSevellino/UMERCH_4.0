import { TabContent } from "@/components/common/TabContent";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import ProductDetailModal from "@/components/product/ProductDetailModal";
import { ShopCategories } from "@/components/shop/ShopCategories";
import ShopHeader from "@/components/shop/ShopHeader";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { ShopSearch } from "@/components/shop/ShopSearch";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useProducts } from "@/hooks/use-products";
import { SHOP_TAXONOMY } from "@/services/products";
import type { Product } from "@/types/product";
import { router } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
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

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "UM CCE Esports Jersey",
    category: "Jersey",
    price: "₱500.00",
    oldPrice: "₱600.00",
    image: require("../../assets/images/product-image/Shirt/cceshirt.jpg"),
  },
  {
    id: 2,
    name: "Wooden Tumbler",
    category: "Drinkware",
    price: "₱515.00",
    oldPrice: "₱650.00",
    image: require("../../assets/images/product-image/Drinkware/wooden-tumbler.jpg"),
  },
  {
    id: 3,
    name: "UM Tote Bag",
    category: "Bags",
    price: "₱180.00",
    oldPrice: "₱220.00",
    hasSize: false,
    image: require("../../assets/images/product-image/Bags/tote-bag.jpg"),
  },
  {
    id: 4,
    name: "Notebook",
    category: "School Supplies",
    price: "₱85.00",
    oldPrice: "₱120.00",
    hasSize: false,
    image: require("../../assets/images/product-image/SchoolSupplies/notebook.png"),
  },
  {
    id: 5,
    name: "UM Mug",
    category: "Drinkware",
    price: "₱250.00",
    oldPrice: "₱300.00",
    image: require("../../assets/images/product-image/Drinkware/mug.png"),
  },
];

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

  const catalog = useProducts(FALLBACK_PRODUCTS, SHOP_TAXONOMY);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalVisible, setProductModalVisible] = useState(false);

  const filteredProducts = catalog.filter((product) => {
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
          onBuyNow={(product, quantity, size) => {
            addItem(product, quantity);
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

    productsGrid: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: Math.round(10 * scale),

      paddingHorizontal: Math.max(12, Math.min(width * 0.04, 14)),

      paddingTop: Math.round(8 * scale),
    },
  });
