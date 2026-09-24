import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCart } from "@/context/CartContext";

type Props = {
  scale?: number;
};

export default function HomeHeader({ scale = 1 }: Props) {
  const styles = createStyles(scale);

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
    <View style={styles.header}>
      {/* Decorative UM background */}
      <View style={styles.headerDecoration}>
        <Text style={styles.headerDecorationText}>UM</Text>
      </View>

      {/* TOP ROW */}

      <View style={styles.headerTop}>
        {/* LOGO + UNIVERSITY */}

        <View style={styles.brandContainer}>
          <Image
            source={require("../../../assets/images/UMERCH.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* HEADER ACTIONS */}

        <View style={styles.headerActions}>
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
                size={Math.round(27 * scale)}
                color="#FFFFFF"
              />

              {totalCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalCount}</Text>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (scale: number) =>
  StyleSheet.create({
    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      height: 68,

      backgroundColor: "#B00000",

      paddingHorizontal: 16,

      flexDirection: "row",
      alignItems: "center",

      overflow: "hidden",
    },

    headerDecoration: {
      position: "absolute",

      right: -20,

      opacity: 0.08,
    },

    headerDecorationText: {
      fontSize: Math.round(122 * scale),
      fontWeight: "900",
      color: "#FFFFFF",
    },

    headerTop: {
      flex: 1,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "space-between",
    },

    brandContainer: {
      flexDirection: "row",

      alignItems: "center",
    },

    logo: {
      width: Math.round(100 * scale),
      height: Math.round(100 * scale),
    },

    headerActions: {
      flexDirection: "row",

      alignItems: "center",

      gap: Math.round(7 * scale),
    },

    cartButton: {
      width: Math.round(42 * scale),
      height: Math.round(42 * scale),

      justifyContent: "center",
      alignItems: "center",

      position: "relative",
    },

    cartBadge: {
      position: "absolute",

      top: 1,
      right: 0,

      width: Math.round(18 * scale),
      height: Math.round(18 * scale),

      borderRadius: Math.round(9 * scale),

      backgroundColor: "#FFFFFF",

      justifyContent: "center",
      alignItems: "center",
    },

    cartBadgeText: {
      color: "#B00000",

      fontSize: Math.max(9, Math.round(9 * scale)),

      fontWeight: "800",
    },
  });