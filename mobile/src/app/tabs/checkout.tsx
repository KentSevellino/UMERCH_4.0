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
    router.replace("/tabs/order-placed");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
              onPress={() => router.replace("/tabs/shop")}
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
    </SafeAreaView>
  );
}

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
