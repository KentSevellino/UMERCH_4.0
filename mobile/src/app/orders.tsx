import { useMemo, useState } from "react";

import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import OrderCard, { Order } from "../components/orders/OrderCard";

import OrderDetailsModal from "../components/orders/OrderDetailsModal";
import OrderFilters, { OrderFilter } from "../components/orders/OrderFilters";
import { useCart } from "../context/CartContext";

/* ==========================================
   ORDER DATA
========================================== */

/* ==========================================
   SCREEN
========================================== */

export default function OrdersScreen() {
  const { placedOrders } = useCart();

  const [selectedFilter, setSelectedFilter] = useState<OrderFilter>("All");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const orders = useMemo<Order[]>(
    () =>
      placedOrders.map((placedOrder) => {
        const firstItem = placedOrder.items[0];
        const total = placedOrder.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        return {
          id: placedOrder.id,
          date: placedOrder.date,
          status: "To Pay",
          productName: firstItem.name,
          quantity: firstItem.quantity,
          price: firstItem.price,
          image: firstItem.image,
          total,
        };
      }),
    [placedOrders],
  );

  /* ========================================
     FILTER ORDERS
  ======================================== */

  const filteredOrders = useMemo(() => {
    if (selectedFilter === "All") {
      return orders;
    }

    return orders.filter((order) => order.status === selectedFilter);
  }, [orders, selectedFilter]);

  const selectedOrder =
    placedOrders.find((order) => order.id === selectedOrderId) ?? null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#B00000" />

      {/* ==================================
          HEADER
      ================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/tabs");
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {/* ==================================
          FILTERS AND ORDERS
      ================================== */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <OrderFilters selected={selectedFilter} onSelect={setSelectedFilter} />

        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => {
                setSelectedOrderId(order.id);
              }}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛍️</Text>

            <Text style={styles.emptyTitle}>No Orders Found</Text>

            <Text style={styles.emptyText}>
              You don&apos;t have any orders in this category.
            </Text>
          </View>
        )}
      </ScrollView>

      <OrderDetailsModal
        visible={selectedOrder !== null}
        order={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
      />
    </SafeAreaView>
  );
}

/* ==========================================
   STYLES
========================================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  header: {
    height: 68,

    backgroundColor: "#B00000",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,
  },

  backButton: {
    width: 42,
    height: 42,

    justifyContent: "center",
    alignItems: "flex-start",
  },

  headerTitle: {
    color: "#FFFFFF",

    fontSize: 23,
    fontWeight: "800",

    flex: 1,

    marginLeft: 4,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 0,
    paddingBottom: 30,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",

    paddingTop: 80,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 50,

    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",

    color: "#303946",

    marginBottom: 7,
  },

  emptyText: {
    fontSize: 13,

    color: "#8A929B",

    textAlign: "center",
  },
});
