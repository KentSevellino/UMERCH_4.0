import { NavBar } from "@/components/nav-bar";
import { TabContent } from "@/components/tab-content";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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

const products = [
  {
    id: 1,
    name: "UM CCE Esports Jersey",
    category: "Shirts",
    price: "₱500.00",
    oldPrice: "₱600.00",
    image: require("../../../assets/images/product-image/cceshirt.jpg"),
  },
  {
    id: 2,
    name: "Wooden Tumbler",
    category: "Bottles",
    price: "₱515.00",
    oldPrice: "₱650.00",
    image: require("../../../assets/images/product-image/wooden-tumbler.jpg"),
  },
  {
    id: 3,
    name: "UM Tote Bag",
    category: "Accessories",
    price: "₱180.00",
    oldPrice: "₱220.00",
    image: require("../../../assets/images/product-image/tote-bag.jpg"),
  },
  {
    id: 4,
    name: "Notebook",
    category: "Others",
    price: "₱85.00",
    oldPrice: "₱120.00",
    image: require("../../../assets/images/product-image/notebook.png"),
  },
  {
    id: 5,
    name: "UM Mug",
    category: "Bottles",
    price: "₱250.00",
    oldPrice: "₱300.00",
    image: require("../../../assets/images/product-image/mug.png"),
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

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width, height);

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

        <View style={styles.header}>
          {/* Decorative UM background */}
          <View style={styles.headerDecoration}>
            <Text style={styles.headerDecorationText}>UM</Text>
          </View>

          {/* TOP ROW */}

          <View style={styles.headerTop}>
            {/* LOGO + UNIVERSITY */}

            <View style={styles.brandContainer}>
              <Image
                source={require("../../../assets/images/UMERCH.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* HEADER ACTIONS */}

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIcon}
                activeOpacity={0.7}
                onPress={() => {
                  console.log("Notifications");
                }}
              >
                <Ionicons
                  name="notifications-outline"
                  size={Math.round(24 * scale)}
                  color="#FFFFFF"
                />

                <View style={styles.notificationDot}>
                  <Text style={styles.notificationNumber}>2</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIcon}
                activeOpacity={0.7}
                onPress={() => {
                  router.push("/tabs/favorites");
                }}
              >
                <Ionicons
                  name="heart-outline"
                  size={Math.round(25 * scale)}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* SEARCH */}

          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={Math.round(21 * scale)}
              color="#777777"
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Search for shirts, hoodies, accessories..."
              placeholderTextColor="#888888"
              returnKeyType="search"
              onSubmitEditing={() => {
                router.push("/tabs/search");
              }}
            />
          </View>
        </View>

        {/* =====================================================
            SCROLL CONTENT
        ====================================================== */}

        <TabContent>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* =================================================
                TRENDING BANNER
            ================================================== */}

            <View style={styles.trendingCard}>
              <Image
                source={require("../../../assets/images/product-image/new-arrival.png")}
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
                RECOMMENDED HEADER
            ================================================== */}

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Recommended for You</Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  router.push("/tabs/shop");
                }}
              >
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>

            {/* =================================================
                CATEGORY FILTER
            ================================================== */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {CATEGORIES.map((category) => {
                const active = selectedCategory === category;

                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterChip,
                      active && styles.filterChipActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedCategory(category);
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
            </ScrollView>

            {/* =================================================
                PRODUCT GRID
            ================================================== */}

            <View style={styles.productsGrid}>
              {filteredProducts.slice(0, 4).map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  scale={scale}
                  styles={styles}
                  grid
                />
              ))}
            </View>

            {/* =================================================
                COLLECTION BANNER
            ================================================== */}

            <TouchableOpacity style={styles.collectionCard} activeOpacity={0.9}>
              {/* Background */}

              <Image
                source={require("../../../assets/images/product-image/Campus-collection.png")}
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

        <NavBar activeTab="home" />
      </View>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| PRODUCT CARD
|--------------------------------------------------------------------------
*/

function ProductCard({
  product,
  index,
  scale,
  styles,
  grid = false,
}: {
  product: (typeof products)[0];
  index: number;
  scale: number;
  styles: ReturnType<typeof createStyles>;
  grid?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.productCard, grid && styles.productCardGrid]}
      activeOpacity={0.85}
      onPress={() => {
        console.log("Product:", product.name);
      }}
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

        <TouchableOpacity style={styles.productHeart} activeOpacity={0.7}>
          <Ionicons
            name="heart-outline"
            size={Math.round(18 * scale)}
            color="#FFFFFF"
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

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const createStyles = (scale: number, width: number, height: number) => {
  const contentPadding = Math.max(12, Math.min(width * 0.04, 14));

  const gridGap = Math.round(10 * scale);

  const gridCardWidth = (width - contentPadding * 2 - gridGap) / 2;

  return StyleSheet.create({
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
       HEADER
    ======================================================== */

    header: {
      height: Math.round(148 * scale),

      backgroundColor: "#B00000",

      paddingHorizontal: Math.max(14, Math.min(width * 0.05, 17)),

      paddingTop:
        Platform.OS === "ios" ? Math.round(8 * scale) : Math.round(10 * scale),

      overflow: "hidden",
    },

    headerDecoration: {
      position: "absolute",

      right: -20,
      top: Math.round(18 * scale),

      opacity: 0.08,
    },

    headerDecorationText: {
      fontSize: Math.round(122 * scale),
      fontWeight: "900",
      color: "#FFFFFF",
    },

    headerTop: {
      height: Math.round(60 * scale),

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "space-between",
    },

    brandContainer: {
      flexDirection: "row",

      alignItems: "center",
    },

    logo: {
      width: Math.round(46 * scale),
      height: Math.round(46 * scale),
    },

    universityContainer: {
      marginLeft: Math.round(8 * scale),
    },

    universityText: {
      color: "#FFFFFF",

      fontSize: Math.max(12, Math.round(14 * scale)),

      fontWeight: "700",

      lineHeight: Math.max(15, Math.round(16 * scale)),
    },

    headerActions: {
      flexDirection: "row",

      alignItems: "center",

      gap: Math.round(7 * scale),
    },

    headerIcon: {
      width: Math.round(36 * scale),
      height: Math.round(36 * scale),

      justifyContent: "center",
      alignItems: "center",

      position: "relative",
    },

    notificationDot: {
      position: "absolute",

      top: 1,
      right: 0,

      width: Math.round(16 * scale),
      height: Math.round(16 * scale),

      borderRadius: Math.round(8 * scale),

      backgroundColor: "#D82222",

      justifyContent: "center",
      alignItems: "center",
    },

    notificationNumber: {
      color: "#FFFFFF",

      fontSize: Math.max(9, Math.round(10 * scale)),

      fontWeight: "800",
    },

    /* ========================================================
       SEARCH
    ======================================================== */

    searchContainer: {
      height: Math.round(42 * scale),

      backgroundColor: "#FFFFFF",

      borderRadius: Math.round(21 * scale),

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: Math.round(14 * scale),

      marginTop: Math.round(3 * scale),
    },

    searchInput: {
      flex: 1,

      height: "100%",

      marginLeft: Math.round(8 * scale),

      fontSize: Math.max(13, Math.round(15 * scale)),

      color: "#222222",
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

    newText: {
      color: "#FFFFFF",

      fontSize: Math.round(40 * scale),

      fontWeight: "900",

      lineHeight: Math.round(42 * scale),
    },

    arrivalsText: {
      color: "#FFFFFF",

      fontSize: Math.round(38 * scale),

      fontWeight: "900",

      lineHeight: Math.round(38 * scale),

      textShadowColor: "#000000",
      textShadowOffset: {
        width: 1,
        height: 1,
      },
      textShadowRadius: 2,
    },

    bannerSubtitle: {
      color: "#FFFFFF",

      fontSize: Math.max(14, Math.round(14 * scale)),

      marginTop: Math.round(4 * scale),
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
       SECTION HEADER
    ======================================================== */

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

    sparkle: {
      fontSize: Math.max(20, Math.round(21 * scale)),

      marginRight: Math.round(5 * scale),
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

    /* ========================================================
       CATEGORY FILTER
    ======================================================== */

    filterRow: {
      flexDirection: "row",

      gap: Math.round(8 * scale),

      paddingBottom: Math.round(11 * scale),
    },

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

    /* ========================================================
       PRODUCTS
    ======================================================== */

    productsGrid: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: gridGap,

      paddingBottom: 4,
    },

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

    justForYouText: {
      color: "#B00000",

      fontSize: Math.max(12, Math.round(12 * scale)),

      fontWeight: "700",
    },

    collectionTitle: {
      color: "#222222",

      fontSize: Math.max(26, Math.round(28 * scale)),

      fontWeight: "900",

      lineHeight: Math.max(28, Math.round(30 * scale)),
    },

    collectionSubtitle: {
      color: "#777777",

      fontSize: Math.max(11, Math.round(12 * scale)),

      lineHeight: Math.max(14, Math.round(15 * scale)),

      marginTop: Math.round(5 * scale),
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
};
