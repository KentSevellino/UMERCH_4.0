import CartHeader from "@/components/cart/CartHeader";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { CheckoutButton } from "@/components/cart/CheckoutButton";
import { TabContent } from "@/components/common/TabContent";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import { useCart } from "@/context/CartContext";
import { router } from "expo-router";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
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
    selectedCartItemIds,
    toggleItemSelection,
    totalCount,
    removeItem,
    updateQuantity,
  } = useCart();

  const reportError = (title: string, error: unknown) => {
    Alert.alert(
      title,
      error instanceof Error ? error.message : "Please try again.",
    );
  };

  const handleChangeQuantity = async (cartItemId: number, quantity: number) => {
    try {
      await updateQuantity(cartItemId, quantity);
    } catch (error) {
      reportError("Could not update quantity", error);
    }
  };

  const handleRemove = async (cartItemId: number) => {
    try {
      await removeItem(cartItemId);
    } catch (error) {
      reportError("Could not remove item", error);
    }
  };

  const subtotal = items.reduce(
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
            {items.map((item) => (
              <CartItem
                key={item.cartItemId ?? item.id}
                item={item}
                selected={selectedCartItemIds.includes(
                  item.cartItemId ?? item.id,
                )}
                onToggleSelection={() =>
                  toggleItemSelection(item.cartItemId ?? item.id)
                }
                onChangeQuantity={handleChangeQuantity}
                onRemove={handleRemove}
              />
            ))}

            {items.length > 0 ? (
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
