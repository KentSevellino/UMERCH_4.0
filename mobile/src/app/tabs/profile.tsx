import { NavBar } from "@/components/nav-bar";
import { TabContent } from "@/components/tab-content";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MenuItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const menuItems: MenuItem[] = [
  {
    id: "personal",
    title: "Personal Information",
    subtitle: "Update your details",
    icon: "person-outline",
  },
  {
    id: "orders",
    title: "My Orders",
    subtitle: "View your purchase history",
    icon: "bag-handle-outline",
  },
  {
    id: "favorites",
    title: "My Favorites",
    subtitle: "Saved items",
    icon: "heart-outline",
  },
  {
    id: "support",
    title: "Help & Support",
    subtitle: "FAQs and contact us",
    icon: "headset-outline",
  },
  {
    id: "settings",
    title: "Settings",
    subtitle: "App preferences",
    icon: "settings-outline",
  },
];

export default function Profile() {
  const { width, height } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 390, 0.9), 1.12);

  const styles = createStyles(scale, width, height);

  const handleMenuPress = (id: string) => {
    switch (id) {
      case "personal":
        console.log("Personal Information");
        break;

      case "orders":
        console.log("My Orders");
        break;

      case "favorites":
        router.push("/tabs/favorites");
        break;

      case "support":
        console.log("Help & Support");
        break;

      case "settings":
        console.log("Settings");
        break;

      default:
        break;
    }
  };

  const handleLogout = () => {
    console.log("Log out");

    // Later:
    // Clear authentication/session here
    // router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        {/* ==================================================
            HEADER
        ================================================== */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* UM Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require("../../../assets/images/umerch-logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.headerTitle}>Profile</Text>
          </View>

          {/* Notification */}
          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={Math.round(26 * scale)}
              color="#FFFFFF"
            />

            {/* Notification badge */}
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <TabContent>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* ==================================================
              PROFILE INFORMATION CARD
          ================================================== */}

            <TouchableOpacity style={styles.profileCard} activeOpacity={0.85}>
              {/* Avatar */}

              <View style={styles.avatar}>
                <Ionicons
                  name="person"
                  size={Math.round(52 * scale)}
                  color="#FFFFFF"
                />
              </View>

              {/* User information */}

              <View style={styles.userInformation}>
                <Text style={styles.userName}>Hi, Kenny</Text>

                <Text style={styles.userRole}>STUDENT</Text>

                <View style={styles.universityRow}>
                  <Ionicons
                    name="school-outline"
                    size={Math.round(19 * scale)}
                    color="#1E293B"
                  />

                  <Text style={styles.universityText}>
                    University of Mindanao
                  </Text>
                </View>
              </View>

              {/* Arrow */}

              <Ionicons
                name="chevron-forward"
                size={Math.round(25 * scale)}
                color="#7A8494"
              />
            </TouchableOpacity>

            {/* ==================================================
              MENU ITEMS
          ================================================== */}

            <View style={styles.menuContainer}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuCard}
                  activeOpacity={0.75}
                  onPress={() => handleMenuPress(item.id)}
                >
                  {/* ICON
                    No background circle */}
                  <View style={styles.menuIcon}>
                    <Ionicons
                      name={item.icon}
                      size={Math.round(30 * scale)}
                      color="#B00000"
                    />
                  </View>

                  {/* TEXT */}

                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>

                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>

                  {/* ARROW */}

                  <Ionicons
                    name="chevron-forward"
                    size={Math.round(24 * scale)}
                    color="#7A8494"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* ==================================================
              LOG OUT
          ================================================== */}

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.75}
            >
              <Ionicons
                name="log-out-outline"
                size={Math.round(25 * scale)}
                color="#B00000"
              />

              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            {/* Space for bottom navigation */}

            <View style={{ height: 100 }} />
          </ScrollView>
        </TabContent>

        {/* ==================================================
            BOTTOM NAVIGATION
        ================================================== */}

        <NavBar activeTab="profile" />
      </View>
    </SafeAreaView>
  );
}

/* ==========================================================
   RESPONSIVE STYLES
========================================================== */

const createStyles = (scale: number, width: number, height: number) =>
  StyleSheet.create({
    /* ======================================================
       SCREEN
    ====================================================== */

    safeArea: {
      flex: 1,
      backgroundColor: "#F7F7F7",
    },

    screen: {
      flex: 1,
      backgroundColor: "#F7F7F7",
    },

    /* ======================================================
       HEADER
    ====================================================== */

    header: {
      height: Math.round(82 * scale),

      backgroundColor: "#B00000",

      paddingHorizontal: Math.max(20, Math.min(width * 0.06, 30)),

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "space-between",

      borderBottomLeftRadius: Math.round(25 * scale),
      borderBottomRightRadius: Math.round(25 * scale),
    },

    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },

    logoContainer: {
      width: Math.round(55 * scale),
      height: Math.round(55 * scale),

      justifyContent: "center",
      alignItems: "center",

      marginRight: Math.round(8 * scale),
    },

    logoImage: {
      width: Math.round(44 * scale),
      height: Math.round(44 * scale),
    },

    headerTitle: {
      color: "#FFFFFF",

      fontSize: Math.round(27 * scale),

      fontWeight: "700",
    },

    notificationButton: {
      width: Math.round(45 * scale),
      height: Math.round(45 * scale),

      justifyContent: "center",
      alignItems: "center",

      position: "relative",
    },

    notificationBadge: {
      position: "absolute",

      top: 2,
      right: 0,

      width: Math.round(20 * scale),
      height: Math.round(20 * scale),

      borderRadius: Math.round(10 * scale),

      backgroundColor: "#E62A2A",

      justifyContent: "center",
      alignItems: "center",
    },

    notificationBadgeText: {
      color: "#FFFFFF",

      fontSize: Math.round(10 * scale),

      fontWeight: "800",
    },

    /* ======================================================
       SCROLL
    ====================================================== */

    scrollView: {
      flex: 1,
    },

    content: {
      paddingHorizontal: Math.max(18, Math.min(width * 0.06, 26)),

      paddingTop: Math.round(18 * scale),

      paddingBottom: 20,
    },

    /* ======================================================
       PROFILE CARD
    ====================================================== */

    profileCard: {
      backgroundColor: "#FFFFFF",

      borderRadius: Math.round(24 * scale),

      paddingHorizontal: Math.round(20 * scale),

      paddingTop: Math.round(22 * scale),

      paddingBottom: Math.round(17 * scale),

      flexDirection: "row",

      flexWrap: "wrap",

      alignItems: "center",

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.06,

      shadowRadius: 7,

      elevation: 2,
    },

    /* ======================================================
       AVATAR
    ====================================================== */

    avatar: {
      width: Math.round(88 * scale),
      height: Math.round(88 * scale),

      borderRadius: Math.round(44 * scale),

      backgroundColor: "#BD5555",

      justifyContent: "center",
      alignItems: "center",

      marginRight: Math.round(17 * scale),
    },

    /* ======================================================
       USER INFO
    ====================================================== */

    userInformation: {
      flex: 1,

      minWidth: 0,
    },

    userName: {
      fontSize: Math.round(25 * scale),

      fontWeight: "800",

      color: "#1E293B",

      marginBottom: 5,
    },

    userRole: {
      fontSize: Math.round(14 * scale),

      fontWeight: "500",

      color: "#7A8494",

      marginBottom: 6,
    },

    universityRow: {
      flexDirection: "row",

      alignItems: "center",
    },

    universityText: {
      fontSize: Math.round(13 * scale),

      color: "#667085",

      marginLeft: 7,

      flexShrink: 1,
    },

    detailsDivider: {
      width: "100%",

      height: 1,

      backgroundColor: "#E5E7EB",

      marginTop: Math.round(21 * scale),

      marginBottom: Math.round(17 * scale),
    },

    /* ======================================================
       DETAILS
    ====================================================== */

    detailsRow: {
      width: "100%",

      flexDirection: "row",

      alignItems: "stretch",
    },

    detailItem: {
      flex: 1,

      minWidth: 0,

      paddingHorizontal: Math.round(5 * scale),
    },

    detailLabel: {
      fontSize: Math.round(13 * scale),

      color: "#7A8494",

      marginTop: 7,

      marginBottom: 4,
    },

    detailValue: {
      fontSize: Math.round(13 * scale),

      color: "#667085",

      fontWeight: "500",
    },

    verticalDivider: {
      width: 1,

      backgroundColor: "#E1E5EA",

      marginHorizontal: Math.round(5 * scale),
    },

    /* ======================================================
       MENU
    ====================================================== */

    menuContainer: {
      marginTop: Math.round(22 * scale),

      gap: Math.round(15 * scale),
    },

    menuCard: {
      minHeight: Math.round(87 * scale),

      backgroundColor: "#FFFFFF",

      borderRadius: Math.round(18 * scale),

      paddingHorizontal: Math.round(18 * scale),

      flexDirection: "row",

      alignItems: "center",

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.035,

      shadowRadius: 5,

      elevation: 1,
    },

    /*
     * IMPORTANT:
     * No background color here.
     *
     * This removes the circular red/pink background
     * from the icons.
     */

    menuIcon: {
      width: Math.round(42 * scale),

      justifyContent: "center",
      alignItems: "flex-start",

      marginRight: Math.round(12 * scale),
    },

    menuTextContainer: {
      flex: 1,

      minWidth: 0,
    },

    menuTitle: {
      fontSize: Math.round(18 * scale),

      fontWeight: "700",

      color: "#1E293B",

      marginBottom: 4,
    },

    menuSubtitle: {
      fontSize: Math.round(14 * scale),

      color: "#7A8494",
    },

    /* ======================================================
       LOGOUT
    ====================================================== */

    logoutButton: {
      height: Math.round(64 * scale),

      marginTop: Math.round(22 * scale),

      marginHorizontal: Math.round(7 * scale),

      paddingHorizontal: Math.round(25 * scale),

      backgroundColor: "#FFF7F7",

      borderRadius: Math.round(16 * scale),

      flexDirection: "row",

      alignItems: "center",
    },

    logoutText: {
      fontSize: Math.round(16 * scale),

      fontWeight: "700",

      color: "#B00000",

      marginLeft: Math.round(17 * scale),
    },
  });
