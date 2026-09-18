import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

type CartSummaryProps = {
  subtotal: number;
  shipping: number;
  total: number;
};

export function CartSummary({ subtotal, shipping, total }: CartSummaryProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width);

  const peso = (value: number) =>
    `₱${value.toFixed(2)}`;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Order Summary</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>

        <Text style={styles.value}>{peso(subtotal)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Shipping</Text>

        <Text style={styles.value}>
          {shipping === 0 ? "FREE" : peso(shipping)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>

        <Text style={styles.totalValue}>{peso(total)}</Text>
      </View>
    </View>
  );
}

const createStyles = (scale: number, width: number) =>
  StyleSheet.create({
    card: {
      marginHorizontal: Math.max(12, Math.min(width * 0.04, 14)),

      marginTop: Math.round(14 * scale),

      backgroundColor: "#FFFFFF",

      borderRadius: Math.round(14 * scale),

      padding: Math.round(16 * scale),

      elevation: 1,

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 1,
      },

      shadowOpacity: 0.07,

      shadowRadius: 3,
    },

    title: {
      color: "#1E293B",

      fontSize: Math.max(16, Math.round(17 * scale)),

      fontWeight: "800",

      marginBottom: Math.round(12 * scale),
    },

    row: {
      flexDirection: "row",

      justifyContent: "space-between",

      alignItems: "center",

      marginBottom: Math.round(8 * scale),
    },

    label: {
      color: "#7A8494",

      fontSize: Math.max(13, Math.round(14 * scale)),
    },

    value: {
      color: "#333333",

      fontSize: Math.max(13, Math.round(14 * scale)),

      fontWeight: "600",
    },

    divider: {
      height: 1,

      backgroundColor: "#EDEDED",

      marginVertical: Math.round(8 * scale),
    },

    totalLabel: {
      color: "#1E293B",

      fontSize: Math.max(15, Math.round(16 * scale)),

      fontWeight: "800",
    },

    totalValue: {
      color: "#B00000",

      fontSize: Math.max(16, Math.round(17 * scale)),

      fontWeight: "900",
    },
  });