import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavBar } from "@/components/nav-bar";
import { TabContent } from "@/components/tab-content";

/*
|--------------------------------------------------------------------------
| PRODUCTS
|--------------------------------------------------------------------------
*/

const products = [
  {
    id: 1,
    name: "UM CCE Esports Jersey",
    category: "Jersey",
    price: "₱500.00",
    oldPrice: "₱600.00",
    image: require("../../../assets/images/product-image/cceshirt.jpg"),
  },
  {
    id: 2,
    name: "Wooden Tumbler",
    category: "Drinkware",
    price: "₱515.00",
    oldPrice: "₱650.00",
    image: require("../../../assets/images/product-image/wooden-tumbler.jpg"),
  },
  {
    id: 3,
    name: "UM Tote Bag",
    category: "Bags",
    price: "₱180.00",
    oldPrice: "₱220.00",
    image: require("../../../assets/images/product-image/tote-bag.jpg"),
  },
  {
    id: 4,
    name: "Notebook",
    category: "School Supplies",
    price: "₱85.00",
    oldPrice: "₱120.00",
    image: require("../../../assets/images/product-image/notebook.png"),
  },
  {
    id: 5,
    name: "UM Mug",
    category: "Drinkware",
    price: "₱250.00",
    oldPrice: "₱300.00",
    image: require("../../../assets/images/product-image/mug.png"),
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

  const contentPadding = Math.max(12, Math.min(width * 0.04, 14));

  const gridGap = Math.round(10 * scale);

  const gridCardWidth = (width - contentPadding * 2 - gridGap) / 2;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        {/* =====================================================
            HEADER
        ====================================================== */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Ionicons
                name="cart"
                size={Math.round(26 * scale)}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.headerTitle}>Shop</Text>
          </View>
        </View>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <TabContent>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productCard, { width: gridCardWidth }]}
                  activeOpacity={0.85}
                  onPress={() => {
                    console.log("Product:", product.name);
                  }}
                >
                  {/* Product image */}

                  <View
                    style={[
                      styles.productImageContainer,
                      { height: Math.round(gridCardWidth * 0.9) },
                    ]}
                  >
                    <Image
                      source={product.image}
                      style={styles.productImage}
                      resizeMode="cover"
                    />

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
              ))}
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </TabContent>

        {/* =====================================================
            BOTTOM NAVIGATION
        ====================================================== */}

        <NavBar activeTab="shop" />
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

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      height: Math.round(82 * scale),

      backgroundColor: "#B00000",

      paddingHorizontal: Math.max(20, Math.min(width * 0.06, 30)),

      flexDirection: "row",

      alignItems: "center",

      borderBottomLeftRadius: Math.round(25 * scale),
      borderBottomRightRadius: Math.round(25 * scale),
    },

    headerLeft: {
      flexDirection: "row",

      alignItems: "center",
    },

    logoContainer: {
      width: Math.round(55 * scale),
      height: Math.round(55 * scale),

      justifyContent: "center",
      alignItems: "center",

      marginRight: Math.round(8 * scale),
    },

    headerTitle: {
      color: "#FFFFFF",

      fontSize: Math.round(27 * scale),

      fontWeight: "700",
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      paddingHorizontal: Math.max(12, Math.min(width * 0.04, 14)),

      paddingTop: Math.round(10 * scale),

      paddingBottom: 20,
    },

    productsGrid: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: Math.round(10 * scale),
    },

    productCard: {
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

    productImageContainer: {
      position: "relative",

      backgroundColor: "#222222",
    },

    productImage: {
      width: "100%",
      height: "100%",
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
  });