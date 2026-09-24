import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type NavTabId =
  | "home"
  | "search"
  | "shop"
  | "cart"
  | "favorites"
  | "profile";

type TabRoute =
  | "/tabs"
  | "/tabs/search"
  | "/tabs/shop"
  | "/tabs/cart"
  | "/tabs/favorites"
  | "/tabs/profile";

type NavTabConfig = {
  id: NavTabId;
  label: string;
  route: TabRoute;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const TABS: NavTabConfig[] = [
  {
    id: "home",
    label: "Home",
    route: "/tabs",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    id: "cart",
    label: "Cart",
    route: "/tabs/cart",
    icon: "cart-outline",
    activeIcon: "cart",
  },
  {
    id: "favorites",
    label: "Favorites",
    route: "/tabs/favorites",
    icon: "heart-outline",
    activeIcon: "heart",
  },
  {
    id: "profile",
    label: "Profile",
    route: "/tabs/profile",
    icon: "person-circle-outline",
    activeIcon: "person-circle",
  },
];

type BottomNavbarProps = {
  activeTab: NavTabId;
};

export function BottomNavbar({ activeTab }: BottomNavbarProps) {
  const { width } = useWindowDimensions();

  const insets = useSafeAreaInsets();

  const scale = Math.min(Math.max(width / 390, 0.9), 1.12);

  const styles = createStyles(scale, insets.bottom);

  return (
    <View style={styles.bottomNavigation}>
      {TABS.slice(0, 2).map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => router.push(tab.route)}
        >
          <Ionicons
            name={activeTab === tab.id ? tab.activeIcon : tab.icon}
            size={Math.round(24 * scale)}
            color={activeTab === tab.id ? "#B00000" : "#7A8494"}
          />

          <Text
            style={[
              styles.navText,
              activeTab === tab.id && styles.activeNavText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}

      {/* SHOP */}

      <TouchableOpacity
        style={styles.cartButton}
        activeOpacity={0.8}
        onPress={() => {
          router.push("/tabs/shop");
        }}
      >
        <Ionicons
          name="bag-handle"
          size={Math.round(30 * scale)}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {/* FAVORITES & PROFILE */}

      {TABS.slice(2).map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => router.push(tab.route)}
        >
          <Ionicons
            name={activeTab === tab.id ? tab.activeIcon : tab.icon}
            size={
              tab.id === "profile"
                ? Math.round(25 * scale)
                : Math.round(24 * scale)
            }
            color={activeTab === tab.id ? "#B00000" : "#7A8494"}
          />

          <Text
            style={[
              styles.navText,
              activeTab === tab.id && styles.activeNavText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const createStyles = (scale: number, bottomInset: number) =>
  StyleSheet.create({
    /* ======================================================
       BOTTOM NAVIGATION
    ====================================================== */

    bottomNavigation: {
      height: Math.round(75 * scale) + bottomInset,

      backgroundColor: "#FFFFFF",

      borderTopWidth: 1,

      borderTopColor: "#EEEEEE",

      flexDirection: "row",

      alignItems: "flex-start",

      justifyContent: "space-around",

      paddingHorizontal: 5,

      paddingTop: 0,

      paddingBottom: bottomInset,
    },

    navItem: {
      flex: 1,

      height: "100%",

      justifyContent: "center",
      alignItems: "center",
    },

    navText: {
      fontSize: Math.round(10 * scale),

      color: "#7A8494",

      marginTop: 4,

      fontWeight: "500",
    },

    activeNavText: {
      color: "#B00000",

      fontWeight: "700",
    },

    /* ======================================================
       CART
    ====================================================== */

    cartButton: {
      width: Math.round(62 * scale),
      height: Math.round(62 * scale),

      borderRadius: Math.round(31 * scale),

      backgroundColor: "#B00000",

      justifyContent: "center",
      alignItems: "center",

      marginTop: Math.round(-28 * scale),

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.2,

      shadowRadius: 4,

      elevation: 5,
    },
  });