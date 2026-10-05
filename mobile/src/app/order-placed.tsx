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
const ORDER_NUMBER = "ORD123456";

export default function OrderPlacedScreen() {
  const { placedOrderItems: items } = useCart();

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );

  const total = subtotal + SHIPPING_FEE;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Return to home"
            style={styles.backButton}
            onPress={() => router.replace("/home")}
          >
            <Ionicons name="arrow-back" size={25} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.logo}>UM</Text>
          <Text style={styles.headerTitle}>Order Placed</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successSection}>
            <View style={styles.successIcon}>
              <Ionicons name="bag-check-outline" size={62} color="#B00000" />
            </View>
            <Text style={styles.successTitle}>Your Order Has Been Placed!</Text>
            <Text style={styles.successText}>
              Thank you for shopping with UMerch!
            </Text>
            <Text style={styles.successText}>
              Your order has been successfully placed.
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <View style={styles.statusIcon}>
              <Ionicons name="time-outline" size={28} color="#F59E0B" />
            </View>
            <View>
              <Text style={styles.statusLabel}>Order Status</Text>
              <Text style={styles.statusValue}>To Pay</Text>
            </View>
          </View>

          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderText}>
                <Text style={styles.orderNumber}>Order #{ORDER_NUMBER}</Text>
                <Text style={styles.orderDate}>Placed just now</Text>
              </View>
              <View style={styles.payButton}>
                <Text style={styles.payButtonText}>To Pay</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {items.length > 0 ? (
              items.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.productRow}>
                    <Image source={item.image} style={styles.productImage} />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.productDetails}>
                        {item.category} | Qty: {item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.productPrice}>
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                  {index < items.length - 1 && (
                    <View style={styles.productDivider} />
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyOrderText}>
                Order details are unavailable.
              </Text>
            )}

            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal ({items.length} items)
              </Text>
              <Text style={styles.summaryValue}>₱{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping Fee</Text>
              <Text style={styles.summaryValue}>
                ₱{SHIPPING_FEE.toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewOrderButton}
            onPress={() => router.replace("/orders")}
            activeOpacity={0.85}
          >
            <Text style={styles.viewOrderText}>View Order Details</Text>
            <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/home")}
          >
            <Ionicons name="home-outline" size={27} color="#7B8798" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/cart")}
          >
            <Ionicons name="cart-outline" size={27} color="#7B8798" />
            <Text style={styles.navText}>Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.centerNavButton}
            onPress={() => router.replace("/shop")}
          >
            <Ionicons name="bag-handle" size={31} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/favorites")}
          >
            <Ionicons name="heart-outline" size={27} color="#7B8798" />
            <Text style={styles.navText}>Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/profile")}
          >
            <Ionicons name="person-circle-outline" size={28} color="#B00000" />
            <Text style={[styles.navText, styles.profileText]}>Profile</Text>
          </TouchableOpacity>
        </View>
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
  successSection: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 15,
  },
  successIcon: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "#FCE5E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  successTitle: {
    color: "#173D68",
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
  },
  successText: {
    color: "#71819A",
    fontSize: 15,
    textAlign: "center",
    marginTop: 6,
  },
  statusContainer: {
    marginTop: 24,
    padding: 14,
    borderRadius: 38,
    backgroundColor: "#FFF0D2",
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFE5B0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  statusLabel: { color: "#71819A", fontSize: 14 },
  statusValue: {
    color: "#F59E0B",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
    marginTop: 20,
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderHeaderText: { flex: 1 },
  orderNumber: { color: "#173D68", fontSize: 18, fontWeight: "800" },
  orderDate: { color: "#71819A", fontSize: 13, marginTop: 4 },
  payButton: {
    backgroundColor: "#B00000",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  payButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  divider: { height: 1, backgroundColor: "#E7EBEF", marginVertical: 14 },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  productImage: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: "#F2F3F4",
  },
  productInfo: { flex: 1, marginHorizontal: 11 },
  productName: {
    color: "#173D68",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
  productDetails: { color: "#71819A", fontSize: 13, marginTop: 5 },
  productPrice: { color: "#B00000", fontSize: 14, fontWeight: "800" },
  productDivider: { height: 1, backgroundColor: "#EEF0F3", marginVertical: 7 },
  emptyOrderText: { color: "#71819A", paddingVertical: 12 },
  summaryDivider: { height: 1, backgroundColor: "#E7EBEF", marginTop: 12 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 13,
  },
  summaryLabel: { color: "#71819A", fontSize: 14 },
  summaryValue: { color: "#71819A", fontSize: 14 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
  },
  totalLabel: { color: "#173D68", fontSize: 18, fontWeight: "800" },
  totalValue: { color: "#B00000", fontSize: 23, fontWeight: "900" },
  viewOrderButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "#B00000",
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    elevation: 4,
  },
  viewOrderText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  bottomNav: {
    height: 78,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
  },
  navItem: { width: 62, alignItems: "center", justifyContent: "center" },
  navText: { color: "#7B8798", fontSize: 11, marginTop: 3 },
  profileText: { color: "#B00000" },
  centerNavButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#B00000",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -25,
    elevation: 5,
  },
});
