import { Ionicons } from "@expo/vector-icons";
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import type { ApiOrder } from "@/services/orders";
import { normalizeImageUrl } from "@/services/products";

type OrderDetailsModalProps = {
  visible: boolean;
  order: ApiOrder | null;
  onClose: () => void;
};

export default function OrderDetailsModal({
  visible,
  order,
  onClose,
}: OrderDetailsModalProps) {
  if (!order) {
    return null;
  }

  const items = order.order_items ?? [];
  const total =
    Number(order.order_total) ||
    items.reduce(
      (sum, item) =>
        sum + Number(item.subtotal || Number(item.price) * item.quantity),
      0,
    );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Order Details</Text>
              <Text style={styles.orderNumber}>#{order.order_id}</Text>
            </View>
            <TouchableOpacity
              accessibilityLabel="Close order details"
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#173D68" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.statusCard}>
              <View style={styles.statusIcon}>
                <Ionicons name="time-outline" size={25} color="#D77A00" />
              </View>
              <View>
                <Text style={styles.statusLabel}>Order Status</Text>
                <Text style={styles.statusValue}>{order.order_status}</Text>
              </View>
            </View>

            <Text style={styles.fulfillment}>
              {order.fulfillment_method === "pickup" ? "Pick-Up" : "Delivery"}
              {order.campus ? ` | ${order.campus}` : ""}
            </Text>

            <Text style={styles.sectionTitle}>Ordered Products</Text>

            {items.map((item, index) => (
              <View key={`${order.order_id}-${index}`}>
                <View style={styles.productRow}>
                  <Image
                    source={
                      normalizeImageUrl(item.product?.product_image) ??
                      require("../../assets/images/umerch-logo.png")
                    }
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.product?.product_name ?? "Product"}
                    </Text>
                    <Text style={styles.productDetail}>
                      {item.variant || "No variety"}
                    </Text>
                    <Text style={styles.productDetail}>
                      Qty: {item.quantity}
                    </Text>
                  </View>
                  <Text style={styles.productPrice}>
                    ₱
                    {Number(
                      item.subtotal || Number(item.price) * item.quantity,
                    ).toFixed(2)}
                  </Text>
                </View>
                {index < items.length - 1 && <View style={styles.divider} />}
              </View>
            ))}

            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Payment</Text>
              <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  modal: {
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F3",
  },
  title: { color: "#173D68", fontSize: 21, fontWeight: "800" },
  orderNumber: { color: "#71819A", fontSize: 13, marginTop: 3 },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F5F7",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingVertical: 16 },
  fulfillment: {
    color: "#71819A",
    fontSize: 13,
    marginBottom: 16,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF2DC",
    borderRadius: 15,
    padding: 13,
    marginBottom: 20,
  },
  statusIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFE5B0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statusLabel: { color: "#71819A", fontSize: 13 },
  statusValue: {
    color: "#D77A00",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  sectionTitle: {
    color: "#173D68",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 11,
    backgroundColor: "#F2F3F4",
  },
  productInfo: { flex: 1, marginHorizontal: 11 },
  productName: {
    color: "#173D68",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  productDetail: { color: "#71819A", fontSize: 13, marginTop: 3 },
  productPrice: { color: "#B00000", fontSize: 14, fontWeight: "800" },
  divider: { height: 1, backgroundColor: "#EEF0F3", marginVertical: 5 },
  totalCard: {
    borderTopWidth: 1,
    borderTopColor: "#E7EBEF",
    marginTop: 15,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { color: "#173D68", fontSize: 17, fontWeight: "800" },
  totalValue: { color: "#B00000", fontSize: 23, fontWeight: "900" },
  doneButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#B00000",
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
});
