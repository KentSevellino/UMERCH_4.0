import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavBar } from "@/components/nav-bar";
import { TabContent } from "@/components/tab-content";

export default function Favorites() {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 390, 0.9), 1.12);

  const styles = createStyles(scale, width);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Ionicons
                name="heart"
                size={Math.round(26 * scale)}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.headerTitle}>Favorites</Text>
          </View>
        </View>

        <TabContent>
          <View style={styles.emptyState}>
            <Ionicons
              name="heart-outline"
              size={Math.round(64 * scale)}
              color="#D5D5D5"
            />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart on products you love.
            </Text>
          </View>
        </TabContent>

        <NavBar activeTab="favorites" />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (scale: number, width: number) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F7F7F7" },
    screen: { flex: 1, backgroundColor: "#F7F7F7" },

    header: {
      height: Math.round(82 * scale),
      backgroundColor: "#B00000",
      paddingHorizontal: Math.max(20, Math.min(width * 0.06, 30)),
      flexDirection: "row",
      alignItems: "center",
      borderBottomLeftRadius: Math.round(25 * scale),
      borderBottomRightRadius: Math.round(25 * scale),
    },

    headerLeft: { flexDirection: "row", alignItems: "center" },

    logoContainer: {
      width: Math.round(55 * scale),
      height: Math.round(55 * scale),
      justifyContent: "center",
      alignItems: "center",
      marginRight: Math.round(8 * scale),
    },

    headerTitle: {
      color: "#FFFFFF",
      fontSize: Math.round(27 * scale),
      fontWeight: "700",
    },

    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 30,
      paddingBottom: Math.round(40 * scale),
    },

    emptyTitle: {
      fontSize: Math.round(19 * scale),
      fontWeight: "800",
      color: "#1E293B",
      marginTop: Math.round(16 * scale),
    },

    emptySubtitle: {
      fontSize: Math.round(14 * scale),
      color: "#7A8494",
      marginTop: 6,
      textAlign: "center",
    },
  });