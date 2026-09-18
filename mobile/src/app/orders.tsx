    import React, { useMemo, useState } from "react";

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

import OrderCard, {
  Order,
} from "../components/orders/OrderCard";

import OrderFilters, {
  OrderFilter,
} from "../components/orders/OrderFilters";


/* ==========================================
   ORDER DATA
========================================== */

const orders: Order[] = [];


/* ==========================================
   SCREEN
========================================== */

export default function OrdersScreen() {

  const [selectedFilter, setSelectedFilter] =
    useState<OrderFilter>("All");


  /* ========================================
     FILTER ORDERS
  ======================================== */

  const filteredOrders = useMemo(() => {

    if (selectedFilter === "All") {
      return orders;
    }

    return orders.filter(
      (order) => order.status === selectedFilter
    );

  }, [selectedFilter]);


  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#B00000"
      />

      {/* ==================================
          HEADER
      ================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          My Orders
        </Text>

      </View>


      {/* ==================================
          FILTERS
      ================================== */}

      <OrderFilters
        selected={selectedFilter}
        onSelect={setSelectedFilter}
      />


      {/* ==================================
          ORDERS
      ================================== */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {filteredOrders.length > 0 ? (

          filteredOrders.map((order) => (

            <OrderCard
              key={order.id}
              order={order}
              onPress={() => {
                console.log(
                  "Open order:",
                  order.id
                );
              }}
            />

          ))

        ) : (

          <View style={styles.emptyContainer}>

            <Text style={styles.emptyIcon}>
              🛍️
            </Text>

            <Text style={styles.emptyTitle}>
              No Orders Found
            </Text>

            <Text style={styles.emptyText}>
              You don't have any orders
              in this category.
            </Text>

          </View>

        )}

      </ScrollView>

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
    paddingHorizontal: 11,
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