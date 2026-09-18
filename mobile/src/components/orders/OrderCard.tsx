import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import OrderStatusBadge, {
  OrderStatus,
} from "./OrderStatusBadge";

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  productName: string;
  quantity: number;
  price: number;
  image: any;
}

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
}

export default function OrderCard({
  order,
  onPress,
}: OrderCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.card}
    >
      {/* ORDER HEADER */}
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>
            #{order.id}
          </Text>

          <Text style={styles.date}>
            {order.date}
          </Text>
        </View>

        <OrderStatusBadge status={order.status} />
      </View>

      {/* PRODUCT */}
      <View style={styles.productContainer}>
        <Image
          source={order.image}
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.productInfo}>
          <Text
            style={styles.productName}
            numberOfLines={1}
          >
            {order.productName}
          </Text>

          <Text style={styles.quantity}>
            {order.quantity} item
            {order.quantity > 1 ? "s" : ""}
          </Text>

          <Text style={styles.price}>
            ₱{order.price.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.total}>
          Total:{" "}
          <Text style={styles.totalPrice}>
            ₱{order.price.toFixed(2)}
          </Text>
        </Text>

        <View style={styles.details}>
          <Text style={styles.detailsText}>
            View Details
          </Text>

          <Text style={styles.arrow}>
            ›
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 13,

    marginBottom: 9,

    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 9,

    borderWidth: 1,
    borderColor: "#EEEEEE",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,

    elevation: 1,
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",

    marginBottom: 8,
  },

  orderNumber: {
    fontSize: 11,
    fontWeight: "700",
    color: "#202C3C",
  },

  date: {
    fontSize: 8,
    color: "#7C8794",
    marginTop: 2,
  },

  productContainer: {
    flexDirection: "row",

    paddingBottom: 9,

    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  productImage: {
    width: 57,
    height: 57,

    borderRadius: 7,

    backgroundColor: "#F2F2F2",
  },

  productInfo: {
    flex: 1,
    marginLeft: 10,

    justifyContent: "center",
  },

  productName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#263344",

    marginBottom: 4,
  },

  quantity: {
    fontSize: 9,
    color: "#7B8792",

    marginBottom: 4,
  },

  price: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D90000",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingTop: 8,
  },

  total: {
    fontSize: 10,
    fontWeight: "600",
    color: "#293343",
  },

  totalPrice: {
    color: "#D90000",
  },

  details: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailsText: {
    fontSize: 9,
    color: "#687482",
  },

  arrow: {
    fontSize: 17,
    color: "#89939E",
    marginLeft: 5,
  },
});