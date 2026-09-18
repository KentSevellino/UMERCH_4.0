import CartHeader from "@/components/navigation/cart/CartHeader";
import { CartItem } from "@/components/navigation/cart/CartItem";
import { CartSummary } from "@/components/navigation/cart/CartSummary";
import { CheckoutButton } from "@/components/navigation/cart/CheckoutButton";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import { TabContent } from "@/components/tab-content";
import { useCart } from "@/context/CartContext";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
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

  const { items, totalCount, removeItem, updateQuantity } = useCart();

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
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
                key={item.id}
                item={item}
                onChangeQuantity={updateQuantity}
                onRemove={removeItem}
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
                    console.log("Check out");
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

        <BottomNavbar activeTab="home" />
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
