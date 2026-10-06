import OrderCard, { type Order } from "@/components/orders/OrderCard";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import OrderFilters, {
    type OrderFilter,
} from "@/components/orders/OrderFilters";
import { fetchOrders, toOrderCardData, type ApiOrder } from "@/services/orders";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [apiOrders, setApiOrders] = useState<ApiOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [filter, setFilter] = useState<OrderFilter>("All");

  const loadOrders = useCallback(() => {
    let cancelled = false;
    fetchOrders()
      .then((rows) => {
        if (!cancelled) {
          setApiOrders(rows);
          setOrders(rows.map(toOrderCardData));
          setSelectedOrder((current) =>
            current
              ? rows.find((r) => r.order_id === current.order_id) ?? current
              : null,
          );
        }
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(loadOrders);

  const filtered = useMemo(
    () =>
      filter === "All"
        ? orders
        : orders.filter((order) => order.status === filter),
    [orders, filter],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <OrderFilters selected={filter} onSelect={setFilter} />
        {filtered.length ? (
          filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() =>
                setSelectedOrder(
                  apiOrders.find(
                    (item) => String(item.order_id) === order.id,
                  ) ?? null,
                )
              }
            />
          ))
        ) : (
          <Text style={styles.empty}>No orders found.</Text>
        )}
      </ScrollView>
      <OrderDetailsModal
        visible={selectedOrder !== null}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={(updatedOrder) => {
          setSelectedOrder(updatedOrder);
          setApiOrders((prev) =>
            prev.map((item) =>
              item.order_id === updatedOrder.order_id ? updatedOrder : item,
            ),
          );
          setOrders((prev) =>
            prev.map((item) =>
              item.id === String(updatedOrder.order_id)
                ? toOrderCardData(updatedOrder)
                : item,
            ),
          );
          // Sync with server
          fetchOrders().then((rows) => {
            setApiOrders(rows);
            setOrders(rows.map(toOrderCardData));
          }).catch(() => {});
        }}
      />
    </SafeAreaView>
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
  content: { paddingBottom: 30 },
  empty: { textAlign: "center", color: "#666666", marginTop: 70, fontSize: 16 },
});
