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
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
    </SafeAreaView>
  );
}

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
