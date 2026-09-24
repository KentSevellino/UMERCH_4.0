import HomeHeader from "@/components/navigation/home/HomeHeader";
import { RecommendedSection } from "@/components/navigation/home/RecommendedSection";
import ProductDetailModal from "@/components/product/ProductDetailModal";
import { ShopSearch } from "@/components/navigation/shop/ShopSearch";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import { TabContent } from "@/components/tab-content";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/*
|--------------------------------------------------------------------------
| PRODUCTS
|--------------------------------------------------------------------------
*/

const CATEGORIES = ["All", "Shirts", "Accessories", "Bottles", "Others"];

const products: Product[] = [
  {
    id: 1,
    name: "UM CCE Esports Jersey",
    category: "Shirts",
    price: "₱500.00",
    oldPrice: "₱600.00",
    image: require("../../assets/images/product-image/cceshirt.jpg"),
  },
  {
    id: 2,
    name: "Wooden Tumbler",
    category: "Bottles",
    price: "₱515.00",
    oldPrice: "₱650.00",
    image: require("../../assets/images/product-image/wooden-tumbler.jpg"),
  },
  {
    id: 3,
    name: "UM Tote Bag",
    category: "Accessories",
    price: "₱180.00",
    oldPrice: "₱220.00",
    image: require("../../assets/images/product-image/tote-bag.jpg"),
  },
  {
    id: 4,
    name: "Notebook",
    category: "Others",
    price: "₱85.00",
    oldPrice: "₱120.00",
    image: require("../../assets/images/product-image/notebook.png"),
  },
  {
    id: 5,
    name: "UM Mug",
    category: "Bottles",
    price: "₱250.00",
    oldPrice: "₱300.00",
    image: require("../../assets/images/product-image/mug.png"),
  },
];

/*
|--------------------------------------------------------------------------
| HOME SCREEN
|--------------------------------------------------------------------------
*/

export default function Home() {
  const { width, height } = useWindowDimensions();

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalVisible, setProductModalVisible] = useState(false);

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width, height);

  const { addItem } = useCart();

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#B00000" />

      <View style={styles.screen}>
        {/* =====================================================
            HEADER
        ====================================================== */}

        <HomeHeader scale={scale} />

        {/* =====================================================
            SEARCH
        ====================================================== */}

        {/* =====================================================
            SCROLL CONTENT
        ====================================================== */}

        <TabContent>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <ShopSearch
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for shirts, hoodies, accessories..."
              onSubmitEditing={() => {
                router.push("/tabs/search");
              }}
              containerStyle={styles.searchFill}
            />
            {/* =================================================
                TRENDING BANNER
            ================================================== */}

            <View style={styles.trendingCard}>
              <Image
                source={require("../../assets/images/product-image/new-arrival.png")}
                style={styles.trendingImage}
                resizeMode="cover"
              />

              {/* Dark overlay */}

              <View style={styles.trendingOverlay} />

              {/* Trending badge */}

              <View style={styles.trendingBadge}>
                <Ionicons
                  name="flame"
                  size={Math.round(13 * scale)}
                  color="#FFFFFF"
                />

                <Text style={styles.trendingBadgeText}>Trending Now</Text>
              </View>

              {/* Slide counter */}

              <View style={styles.slideCounter}>
                <Text style={styles.slideCounterText}>1 / 3</Text>
              </View>

              {/* Banner text */}

              <View style={styles.bannerTextContainer}>
                <TouchableOpacity
                  style={styles.shopButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    console.log("Shop Now");
                  }}
                >
                  <Text style={styles.shopButtonText}>Shop Now</Text>

                  <Ionicons
                    name="arrow-forward"
                    size={Math.round(14 * scale)}
                    color="#222222"
                  />
                </TouchableOpacity>
              </View>

              {/* Slider arrows */}

              <TouchableOpacity
                style={[styles.sliderButton, styles.sliderLeft]}
              >
                <Ionicons
                  name="chevron-back"
                  size={Math.round(18 * scale)}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sliderButton, styles.sliderRight]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={Math.round(18 * scale)}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            {/* =================================================
                RECOMMENDED
            ================================================== */}

            <RecommendedSection
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onSeeAll={() => {
                router.push("/tabs/shop");
              }}
              products={filteredProducts.slice(0, 4)}
              onProductPress={(product) => {
                setSelectedProduct(product);
                setProductModalVisible(true);
              }}
            />

            {/* =================================================
                COLLECTION BANNER
            ================================================== */}

            <TouchableOpacity style={styles.collectionCard} activeOpacity={0.9}>
              {/* Background */}

              <Image
                source={require("../../assets/images/product-image/Campus-collection.png")}
                style={styles.collectionImage}
                resizeMode="contain"
              />

              {/* Text */}

              <View style={styles.collectionText}>
                <View style={styles.justForYouRow}>
                  <Ionicons
                    name="sparkles"
                    size={Math.round(14 * scale)}
                    color="#B00000"
                  />
                </View>
              </View>

              {/* Button */}

              <View style={styles.collectionButtonContainer}>
                <TouchableOpacity style={styles.collectionButton}>
                  <Text style={styles.collectionButtonText}>
                    Explore Collection
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={Math.round(13 * scale)}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Bottom spacing */}

            <View style={{ height: 100 }} />
          </ScrollView>
        </TabContent>

        {/* =====================================================
            BOTTOM NAVIGATION
        ====================================================== */}

        <BottomNavbar activeTab="home" />

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

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const createStyles = (scale: number, width: number, height: number) =>
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    safeArea: {
      flex: 1,
      backgroundColor: "#F5F5F5",
    },

    screen: {
      flex: 1,
      backgroundColor: "#F5F5F5",
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    scrollView: {
      flex: 1,
    },

    content: {
      paddingHorizontal: Math.max(12, Math.min(width * 0.04, 14)),

      paddingTop: Math.round(10 * scale),

      paddingBottom: 20,
    },

    /* ========================================================
       SEARCH
    ======================================================== */

    searchFill: {
      marginHorizontal: 0,
    },

    /* ========================================================
       TRENDING
    ======================================================== */

    trendingCard: {
      height: Math.round(165 * scale),

      borderRadius: Math.round(12 * scale),

      overflow: "hidden",

      position: "relative",

      backgroundColor: "#333333",
    },

    trendingImage: {
      width: "100%",
      height: "100%",

      position: "absolute",
    },

    trendingOverlay: {
      position: "absolute",

      left: 0,
      right: 0,
      top: 0,
      bottom: 0,

      backgroundColor: "rgba(0,0,0,0.28)",
    },

    trendingBadge: {
      position: "absolute",

      top: Math.round(12 * scale),
      left: Math.round(13 * scale),

      height: Math.round(23 * scale),

      paddingHorizontal: Math.round(9 * scale),

      borderRadius: Math.round(12 * scale),

      backgroundColor: "#A90000",

      flexDirection: "row",

      alignItems: "center",

      gap: 4,
    },

    trendingBadgeText: {
      color: "#FFFFFF",

      fontSize: Math.max(14, Math.round(14 * scale)),

      fontWeight: "700",
    },

    slideCounter: {
      position: "absolute",

      top: Math.round(12 * scale),
      right: Math.round(12 * scale),

      backgroundColor: "rgba(0,0,0,0.4)",

      paddingHorizontal: Math.round(8 * scale),
      paddingVertical: Math.round(4 * scale),

      borderRadius: Math.round(8 * scale),
    },

    slideCounterText: {
      color: "#FFFFFF",

      fontSize: Math.max(14, Math.round(14 * scale)),

      fontWeight: "700",
    },

    bannerTextContainer: {
      position: "absolute",

      left: Math.round(17 * scale),
      bottom: Math.round(14 * scale),
    },

    shopButton: {
      height: Math.round(30 * scale),

      paddingHorizontal: Math.round(13 * scale),

      backgroundColor: "#FFFFFF",

      borderRadius: Math.round(16 * scale),

      flexDirection: "row",

      alignItems: "center",

      alignSelf: "flex-start",

      gap: 6,
    },

    shopButtonText: {
      fontSize: Math.max(12, Math.round(12 * scale)),

      color: "#222222",

      fontWeight: "700",
    },

    sliderButton: {
      position: "absolute",

      bottom: Math.round(14 * scale),

      width: Math.round(27 * scale),
      height: Math.round(27 * scale),

      borderRadius: Math.round(14 * scale),

      backgroundColor: "rgba(50,50,50,0.65)",

      justifyContent: "center",
      alignItems: "center",
    },

    sliderLeft: {
      right: Math.round(47 * scale),
    },

    sliderRight: {
      right: Math.round(12 * scale),
    },

    /* ========================================================
       COLLECTION
    ======================================================== */

    collectionCard: {
      height: Math.round(155 * scale),

      marginTop: Math.round(17 * scale),

      borderRadius: Math.round(12 * scale),

      overflow: "hidden",

      position: "relative",

      backgroundColor: "#FFF2F2",
    },

    collectionImage: {
      width: "100%",
      height: "100%",

      position: "absolute",
    },

    collectionText: {
      position: "absolute",

      left: Math.round(15 * scale),
      top: Math.round(14 * scale),

      zIndex: 5,
    },

    collectionButtonContainer: {
      position: "absolute",

      left: Math.round(15 * scale),
      bottom: Math.round(14 * scale),

      zIndex: 5,
    },

    justForYouRow: {
      flexDirection: "row",

      alignItems: "center",

      gap: Math.round(5 * scale),
    },

    collectionButton: {
      height: Math.round(28 * scale),

      backgroundColor: "#B00000",

      borderRadius: Math.round(14 * scale),

      paddingHorizontal: Math.round(12 * scale),

      flexDirection: "row",

      alignItems: "center",

      alignSelf: "flex-start",

      gap: Math.round(5 * scale),
    },

    collectionButtonText: {
      color: "#FFFFFF",

      fontSize: Math.max(11, Math.round(12 * scale)),

      fontWeight: "700",
    },
  });
