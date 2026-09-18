import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  scale?: number;
  itemCount?: number;
};

export default function CartHeader({
  scale = 1,
  itemCount = 0,
}: Props) {
  return (
    <View
      style={[
        styles.container,
        {
          height: 68,
          paddingHorizontal: 16,
        },
      ]}
    >

      {/* Title */}
      <View style={styles.titleContainer}>
        <Ionicons
          name="cart"
          size={22 * scale}
          color="#FFFFFF"
        />

        <Text
          style={[
            styles.title,
            {
              fontSize: 21 * scale,
            },
          ]}
        >
          Cart
        </Text>

        {itemCount > 0 && (
          <Text
            style={[
              styles.count,
              {
                fontSize: 12 * scale,
              },
            ]}
          >
            ({itemCount})
          </Text>
        )}
      </View>

      {/* Delete */}
      <TouchableOpacity
        style={styles.iconButton}
      >
        <Ionicons
          name="trash-outline"
          size={23 * scale}
          color="#FFFFFF"
        />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#B00000",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  title: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  count: {
    color: "#F4D5D5",
  },
});