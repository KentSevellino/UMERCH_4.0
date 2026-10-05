import CartHeader from "@/components/cart/CartHeader";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { CheckoutButton } from "@/components/cart/CheckoutButton";
import { TabContent } from "@/components/common/TabContent";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SHIPPING = 0;

/*
|--------------------------------------------------------------------------
| CART SCREEN
|--------------------------------------------------------------------------
*/

export default function Cart() {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width);

  const {
    items,
    selectedItems,
    selectedCartItemIds,
    toggleItemSelection,
    selectAllItems,
    totalCount,
    removeItem,
    updateQuantity,
  } = useCart();

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const total = subtotal + SHIPPING;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        <CartHeader scale={scale} itemCount={totalCount} />

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <TabContent>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {items.length > 0 ? (
              <TouchableOpacity
                style={styles.selectAll}
                onPress={selectAllItems}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    selectedCartItemIds.length === items.length
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={22}
                  color="#B00000"
                />
                <Text style={styles.selectAllText}>Select all</Text>
              </TouchableOpacity>
            ) : null}

            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                selected={selectedCartItemIds.includes(
                  item.cartItemId ?? item.id,
                )}
                onToggleSelection={() =>
                  toggleItemSelection(item.cartItemId ?? item.id)
                }
                onChangeQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}

            {selectedItems.length > 0 ? (
              <>
                <CartSummary
                  subtotal={subtotal}
                  shipping={SHIPPING}
                  total={total}
                />

                <CheckoutButton
                  onPress={() => {
                    router.push("/checkout");
                  }}
                />
              </>
            ) : items.length > 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>
                  Select an item to checkout
                </Text>
                <Text style={styles.emptySubtitle}>
                  Choose at least one product from your cart.
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>

                <Text style={styles.emptySubtitle}>
                  Add products to see them here.
                </Text>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </TabContent>

        {/* =====================================================
            BOTTOM NAVIGATION
        ====================================================== */}

        <BottomNavbar activeTab="cart" />
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
      paddingTop: Math.round(12 * scale),

      paddingBottom: 20,

      gap: Math.round(10 * scale),
    },

    selectAll: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Math.round(12 * scale),
      paddingVertical: Math.round(4 * scale),
      gap: 8,
    },

    selectAllText: {
      color: "#333333",
      fontSize: Math.round(14 * scale),
      fontWeight: "700",
    },

    emptyState: {
      alignItems: "center",

      justifyContent: "center",

      paddingTop: Math.round(80 * scale),

      paddingHorizontal: Math.round(30 * scale),
    },

    emptyTitle: {
      color: "#1E293B",

      fontSize: Math.max(17, Math.round(18 * scale)),

      fontWeight: "800",
    },

    emptySubtitle: {
      color: "#7A8494",

      fontSize: Math.max(13, Math.round(14 * scale)),

      marginTop: Math.round(6 * scale),

      textAlign: "center",
    },
  });
