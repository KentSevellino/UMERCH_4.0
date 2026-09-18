import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCart } from "@/context/CartContext";

type Props = {
  scale?: number;
};

export default function ShopHeader({ scale = 1 }: Props) {
  const { totalCount, bump } = useCart();

  const [cartScale] = useState(() => new Animated.Value(1));
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    Animated.sequence([
      Animated.delay(200),
      Animated.spring(cartScale, {
        toValue: 1.4,
        useNativeDriver: true,
        speed: 50,
        bounciness: 18,
      }),
      Animated.spring(cartScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 14,
      }),
    ]).start();
  }, [bump, cartScale]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: 16,
        },
      ]}
    >

      {/* ================= TITLE ================= */}

      <View style={styles.titleRow}>

        <View style={styles.titleLeft}>
          <Ionicons
            name="bag-handle"
            size={25 * scale}
            color="#FFFFFF"
          />

          <Text
            style={[
              styles.title,
              {
                fontSize: 23 * scale,
              },
            ]}
          >
            Shop
          </Text>
        </View>

        {/* Cart */}
        <TouchableOpacity
          style={styles.cartButton}
          activeOpacity={0.7}
          onPress={() => {
            router.push("/tabs/cart");
          }}
        >
          <Animated.View
            style={{
              transform: [{ scale: cartScale }],
            }}
          >
            <Ionicons
              name="cart-outline"
              size={27 * scale}
              color="#FFFFFF"
            />

            {totalCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {totalCount}
                </Text>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 68,

    backgroundColor: "#B00000",
  },

  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  title: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  cartButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  cartBadge: {
    position: "absolute",
    top: 1,
    right: 0,

    width: 18,
    height: 18,
    borderRadius: 9,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",
  },

  cartBadgeText: {
    color: "#B00000",
    fontSize: 9,
    fontWeight: "800",
  },
});