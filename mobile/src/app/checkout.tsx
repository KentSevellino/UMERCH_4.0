import { useCart } from "@/context/CartContext";
import { placeOrder } from "@/services/orders";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutScreen() {
  const { selectedItems, refresh } = useCart();
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "cashier" | "salary_deduction"
  >("cashier");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<
    "delivery" | "pickup"
  >("delivery");
  const [campus, setCampus] = useState("");
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal;
  const canPlaceOrder =
    selectedItems.length > 0 &&
    !placing &&
    (fulfillmentMethod === "pickup" || campus.length > 0);

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder) return;
    setPlacing(true);
    try {
      await placeOrder({
        paymentMethod,
        cartItems: selectedItems.map((item) => ({
          cartItemId: item.cartItemId,
          productId: item.id,
          variant: item.variant,
          quantity: item.quantity,
          price: item.price,
        })),
        fulfillmentMethod,
        campus: fulfillmentMethod === "delivery" ? campus : null,
      });
      await refresh();
      router.replace("/orders");
    } catch (error) {
      Alert.alert(
        "Could not place order",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={25} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {selectedItems.length === 0 ? (
          <Text style={styles.empty}>Your cart is empty.</Text>
        ) : (
          <>
            {selectedItems.map((item) => (
              <View key={item.cartItemId ?? item.id} style={styles.row}>
                <Image source={item.image} style={styles.productImage} />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {item.variant ? `${item.variant} | ` : ""}x{item.quantity}
                  </Text>
                </View>
                <Text style={styles.price}>
                  ₱{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <OptionRow
                label="Cashier Payment"
                selected={paymentMethod === "cashier"}
                onPress={() => setPaymentMethod("cashier")}
              />
              <OptionRow
                label="Salary Deduction (Professor Only)"
                selected={paymentMethod === "salary_deduction"}
                onPress={() => setPaymentMethod("salary_deduction")}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Fulfillment Method</Text>
              <View style={styles.optionGroup}>
                <OptionRow
                  label="Delivery"
                  selected={fulfillmentMethod === "delivery"}
                  onPress={() => setFulfillmentMethod("delivery")}
                />
                <OptionRow
                  label="Pick-Up"
                  selected={fulfillmentMethod === "pickup"}
                  onPress={() => setFulfillmentMethod("pickup")}
                />
              </View>
              {fulfillmentMethod === "delivery" ? (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.campusLabel}>Select Campus</Text>
                  <View style={styles.campusOptions}>
                    {[
                      ["main", "UM MAIN MATINA"],
                      ["north", "UM TAGUM"],
                      ["south", "UM PANABO"],
                      ["east", "UM PENAPLATA"],
                      ["west", "UM DIGOS"],
                    ].map(([value, label]) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.campusButton,
                          campus === value && styles.campusButtonSelected,
                        ]}
                        onPress={() => setCampus(value)}
                      >
                        <Text
                          style={[
                            styles.campusText,
                            campus === value && styles.campusTextSelected,
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : null}
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>SUBTOTAL</Text>
                <Text style={styles.summaryValue}>₱{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.total}>₱{total.toFixed(2)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.button, !canPlaceOrder && styles.buttonDisabled]}
              onPress={handlePlaceOrder}
              disabled={!canPlaceOrder}
            >
              <Text style={styles.buttonText}>
                {placing ? "Placing order..." : "Place Order"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.optionRow}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <Text style={styles.optionText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F7F7" },
  header: {
    height: 68,
    backgroundColor: "#B00000",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: { width: 42, height: 42, justifyContent: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 23, fontWeight: "800" },
  content: { padding: 20 },
  empty: { textAlign: "center", marginTop: 80, fontSize: 18, color: "#333333" },
  row: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#EEEEEE",
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: "#222222" },
  meta: { marginTop: 4, color: "#666666" },
  price: { color: "#B00000", fontWeight: "700" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 18,
  },
  totalLabel: { fontSize: 18, fontWeight: "800" },
  total: { fontSize: 22, fontWeight: "900", color: "#B00000" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 12,
  },
  optionGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
    marginBottom: 10,
    minHeight: 36,
  },
  optionText: { color: "#222222", fontSize: 15, flexShrink: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#777777",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: { borderColor: "#B00000" },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#B00000",
  },
  divider: { height: 1, backgroundColor: "#222222", marginVertical: 8 },
  campusLabel: { color: "#222222", fontSize: 14, marginBottom: 8 },
  campusOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  campusButton: {
    borderWidth: 1,
    borderColor: "#D5D5D5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  campusButtonSelected: { backgroundColor: "#B00000", borderColor: "#B00000" },
  campusText: { color: "#555555", fontSize: 12 },
  campusTextSelected: { color: "#FFFFFF", fontWeight: "700" },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: { color: "#222222", fontSize: 15, fontWeight: "600" },
  summaryValue: { color: "#222222", fontSize: 16 },
  button: {
    backgroundColor: "#B00000",
    borderRadius: 26,
    padding: 16,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  buttonDisabled: { backgroundColor: "#C98B8B" },
});
