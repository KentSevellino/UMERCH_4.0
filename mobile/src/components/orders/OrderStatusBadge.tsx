import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type OrderStatus =
  | "To Pay"
  | "To Receive"
  | "Completed"
  | "Canceled";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export default function OrderStatusBadge({
  status,
}: OrderStatusBadgeProps) {
  const getStatusStyle = () => {
    switch (status) {
      case "Completed":
        return {
          backgroundColor: "#E7F7EA",
          color: "#16843A",
          icon: "✓",
        };

      case "To Receive":
        return {
          backgroundColor: "#E5F2FF",
          color: "#0875CE",
          icon: "🚚",
        };

      case "To Pay":
        return {
          backgroundColor: "#FFF2DC",
          color: "#D77A00",
          icon: "▣",
        };

      case "Canceled":
        return {
          backgroundColor: "#EEEEEE",
          color: "#777777",
          icon: "×",
        };
    }
  };

  const style = getStatusStyle();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: style.backgroundColor },
      ]}
    >
      <Text style={[styles.icon, { color: style.color }]}>
        {style.icon}
      </Text>

      <Text style={[styles.text, { color: style.color }]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  icon: {
    fontSize: 10,
    fontWeight: "700",
    marginRight: 5,
  },

  text: {
    fontSize: 10,
    fontWeight: "600",
  },
});