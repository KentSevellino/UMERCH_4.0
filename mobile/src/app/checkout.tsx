<<<<<<< HEAD
import { useCart } from "@/context/CartContext";
import { placeOrder } from "@/services/orders";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CAMPUSES = [
  { value: "main", label: "UM MAIN MATINA" },
  { value: "north", label: "UM TAGUM" },
  { value: "south", label: "UM PANABO" },
  { value: "east", label: "UM PENAPLATA" },
  { value: "west", label: "UM DIGOS" },
];

const FULFILLMENTS = [
  { value: "delivery", label: "Delivery" },
  { value: "pickup", label: "Pickup" },
];

export default function CheckoutScreen() {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width);

  const { items, refresh } = useCart();

  const [fulfillment, setFulfillment] = useState("delivery");
  const [campus, setCampus] = useState("");
  const [placing, setPlacing] = useState(false);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const canPlaceOrder =
    items.length > 0 &&
    !placing &&
    (fulfillment !== "delivery" || campus !== "");

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder) return;

    setPlacing(true);

    try {
      await placeOrder({
        cartItems: items.map((item) => ({
          cartItemId: item.cartItemId,
          productId: item.id,
          variant: item.variant,
          quantity: item.quantity,
          price: item.price,
        })),
        fulfillmentMethod: fulfillment,
        campus: fulfillment === "delivery" ? campus : null,
      });

      await refresh();
      router.replace("/orders");
    } catch (error) {
      Alert.alert(
        "Could not place order",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setPlacing(false);
    }
=======
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useCart } from "@/context/CartContext";

const SHIPPING_FEE = 0;

export default function CheckoutScreen() {
  const { items, placeOrder } = useCart();

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );

  const total = subtotal + SHIPPING_FEE;

  const handlePlaceOrder = () => {
    placeOrder();
    router.replace("/order-placed");
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
  };

  return (
    <SafeAreaView style={styles.safeArea}>
<<<<<<< HEAD
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={Math.round(25 * scale)} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Checkout</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ITEMS */}
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.card}>
            {items.map((item) => (
              <View
                key={item.cartItemId ?? item.id}
                style={styles.summaryRow}
              >
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryName} numberOfLines={1}>
                    {item.name}
                  </Text>

                  <Text style={styles.summaryMeta}>
                    {item.variant ? `${item.variant} · ` : ""}
                    x{item.quantity}
                  </Text>
                </View>

                <Text style={styles.summaryPrice}>
                  ₱{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* FULFILLMENT */}
          <Text style={styles.sectionTitle}>Fulfillment Method</Text>

          <View style={styles.chipRow}>
            {FULFILLMENTS.map((option) => {
              const active = fulfillment === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setFulfillment(option.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CAMPUS */}
          {fulfillment === "delivery" ? (
            <>
              <Text style={styles.sectionTitle}>Select Campus</Text>

              <View style={styles.chipRow}>
                {CAMPUSES.map((option) => {
                  const active = campus === option.value;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setCampus(option.value)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.chipText, active && styles.chipTextActive]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}

          {/* TOTAL */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>

            <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.placeButton, !canPlaceOrder && styles.placeButtonDisabled]}
            onPress={handlePlaceOrder}
            disabled={!canPlaceOrder}
            activeOpacity={0.85}
          >
            <Text style={styles.placeButtonText}>
              {placing ? "Placing order…" : "Place Order"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
=======
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Go back"
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={25} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.logo}>UM</Text>
          <Text style={styles.headerTitle}>Checkout</Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bag-handle-outline" size={52} color="#B00000" />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add a product before proceeding to checkout.
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.replace("/shop")}
            >
              <Text style={styles.shopButtonText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons
                      name="bag-handle-outline"
                      size={24}
                      color="#B00000"
                    />
                    <Text style={styles.sectionTitle}>Order Items</Text>
                  </View>
                  <Text style={styles.itemCount}>{items.length} items</Text>
                </View>

                {items.map((item, index) => (
                  <View key={item.id}>
                    <View style={styles.orderItem}>
                      <Image source={item.image} style={styles.productImage} />
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.productDetail}>
                          {item.category}
                        </Text>
                        <Text style={styles.productDetail}>
                          Qty: {item.quantity}
                        </Text>
                      </View>
                      <Text style={styles.productPrice}>
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                    {index < items.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.card}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="card-outline" size={24} color="#B00000" />
                  <Text style={styles.sectionTitle}>Payment Method</Text>
                </View>
                <View style={styles.paymentOption}>
                  <View style={styles.radio}>
                    <View style={styles.radioInner} />
                  </View>
                  <Ionicons name="person-outline" size={27} color="#173D68" />
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>Cashier</Text>
                    <Text style={styles.paymentSubtitle}>
                      Pay at the university cashier
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="receipt-outline" size={24} color="#B00000" />
                  <Text style={styles.sectionTitle}>Order Summary</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Subtotal ({items.length} items)
                  </Text>
                  <Text style={styles.summaryValue}>
                    ₱{subtotal.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping Fee</Text>
                  <Text style={styles.summaryValue}>
                    ₱{SHIPPING_FEE.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomContainer}>
              <TouchableOpacity
                style={styles.placeOrderButton}
                onPress={handlePlaceOrder}
                activeOpacity={0.85}
              >
                <Text style={styles.placeOrderText}>Place Order</Text>
                <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
    </SafeAreaView>
  );
}

<<<<<<< HEAD
const createStyles = (scale: number, width: number) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },

    safeArea: {
      flex: 1,
      backgroundColor: "#B00000",
    },

    header: {
      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: Math.max(18, Math.min(width * 0.06, 26)),

      paddingVertical: Math.round(14 * scale),

      backgroundColor: "#B00000",
    },

    backButton: {
      width: 44,
      height: 44,

      justifyContent: "center",
      alignItems: "flex-start",

      marginRight: Math.round(6 * scale),
    },

    headerTitle: {
      fontSize: Math.round(22 * scale),

      fontWeight: "900",
      color: "#FFFFFF",
    },

    container: {
      paddingHorizontal: Math.max(18, Math.min(width * 0.06, 26)),

      paddingTop: Math.round(18 * scale),
      paddingBottom: 24,

      backgroundColor: "#F7F7F7",
      flexGrow: 1,
    },

    sectionTitle: {
      fontSize: Math.round(15 * scale),

      fontWeight: "800",
      color: "#222222",

      marginTop: Math.round(20 * scale),
      marginBottom: Math.round(10 * scale),
    },

    card: {
      backgroundColor: "#FFFFFF",

      borderRadius: Math.round(14 * scale),

      padding: Math.round(14 * scale),
    },

    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      paddingVertical: Math.round(6 * scale),

      gap: Math.round(12 * scale),
    },

    summaryInfo: {
      flex: 1,
    },

    summaryName: {
      fontSize: Math.round(14 * scale),
      fontWeight: "700",
      color: "#222222",
    },

    summaryMeta: {
      fontSize: Math.round(12 * scale),
      color: "#575757",

      marginTop: Math.round(2 * scale),
    },

    summaryPrice: {
      fontSize: Math.round(14 * scale),
      fontWeight: "700",
      color: "#B00000",
    },

    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",

      gap: Math.round(8 * scale),
    },

    chip: {
      paddingHorizontal: Math.round(14 * scale),
      paddingVertical: Math.round(10 * scale),

      borderRadius: Math.round(10 * scale),

      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#DDDDDD",
    },

    chipActive: {
      backgroundColor: "#B00000",
      borderColor: "#B00000",
    },

    chipText: {
      fontSize: Math.round(13 * scale),
      fontWeight: "600",
      color: "#333333",
    },

    chipTextActive: {
      color: "#FFFFFF",
    },

    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",

      marginTop: Math.round(26 * scale),
      marginBottom: Math.round(14 * scale),
    },

    totalLabel: {
      fontSize: Math.round(16 * scale),
      fontWeight: "800",
      color: "#9C0306",
    },

    totalValue: {
      fontSize: Math.round(22 * scale),
      fontWeight: "900",
      color: "#9C0306",
    },

    placeButton: {
      height: Math.round(52 * scale),

      borderRadius: Math.round(27 * scale),

      backgroundColor: "#B00000",

      justifyContent: "center",
      alignItems: "center",
    },

    placeButtonDisabled: {
      backgroundColor: "#D08A8A",
    },

    placeButtonText: {
      color: "#FFFFFF",
      fontSize: Math.round(15 * scale),
      fontWeight: "800",
    },
  });
=======
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F5" },
  screen: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    height: 78,
    backgroundColor: "#B00000",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    color: "#FFDC00",
    fontSize: 27,
    fontWeight: "900",
    fontStyle: "italic",
    marginLeft: 8,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
    marginLeft: 12,
  },
  content: { padding: 15, paddingBottom: 24 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center" },
  sectionTitle: {
    color: "#173D68",
    fontSize: 19,
    fontWeight: "800",
    marginLeft: 10,
  },
  itemCount: { color: "#71819A", fontSize: 14 },
  orderItem: { minHeight: 92, flexDirection: "row", alignItems: "center" },
  productImage: {
    width: 82,
    height: 82,
    borderRadius: 12,
    backgroundColor: "#F2F3F4",
  },
  productInfo: { flex: 1, paddingHorizontal: 12 },
  productName: {
    color: "#173D68",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
  productDetail: { color: "#71819A", fontSize: 13, marginTop: 3 },
  productPrice: { color: "#B00000", fontSize: 15, fontWeight: "800" },
  divider: { height: 1, backgroundColor: "#E9EDF2", marginVertical: 10 },
  paymentOption: {
    minHeight: 78,
    backgroundColor: "#F7F9FC",
    borderRadius: 14,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  radio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#B00000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#B00000",
  },
  paymentInfo: { marginLeft: 13 },
  paymentTitle: { color: "#173D68", fontSize: 17, fontWeight: "700" },
  paymentSubtitle: { color: "#71819A", fontSize: 13, marginTop: 3 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  summaryLabel: { color: "#71819A", fontSize: 15 },
  summaryValue: { color: "#71819A", fontSize: 15, fontWeight: "600" },
  summaryDivider: { height: 1, backgroundColor: "#E3E7EC", marginTop: 18 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 17,
  },
  totalLabel: { color: "#173D68", fontSize: 18, fontWeight: "800" },
  totalValue: { color: "#B00000", fontSize: 23, fontWeight: "900" },
  bottomContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  placeOrderButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "#B00000",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    elevation: 4,
  },
  placeOrderText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyTitle: {
    color: "#173D68",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 15,
  },
  emptySubtitle: {
    color: "#71819A",
    fontSize: 15,
    textAlign: "center",
    marginTop: 7,
  },
  shopButton: {
    backgroundColor: "#B00000",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 13,
    marginTop: 22,
  },
  shopButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
