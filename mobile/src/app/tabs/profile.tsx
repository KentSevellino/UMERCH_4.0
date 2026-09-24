import { LogoutButton } from "@/components/navigation/profile/LogoutButton";
import ProfileHeader from "@/components/navigation/profile/ProfileHeader";
import { ProfileInfo } from "@/components/navigation/profile/ProfileInfo";
import { ProfileDetails } from "@/components/navigation/profile/ProfileDetails";
import { useProfileImage } from "@/hooks/use-profile-image";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import { TabContent } from "@/components/tab-content";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 390, 0.9), 1.12);

  const styles = createStyles(scale, width);

  const { avatarUri, changeProfileImage } = useProfileImage();

  const handleMenuPress = (id: string) => {
    switch (id) {
      case "personal":
        console.log("Personal Information");
        break;

      case "orders":
        router.push("/orders");
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
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        {/* ==================================================
            HEADER
        ================================================== */}

        <ProfileHeader scale={scale} notificationCount={2} />

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

            <ProfileInfo
              name="Kenny"
              role="STUDENT"
              university="University of Mindanao"
              avatarUri={avatarUri}
              onChangeAvatar={changeProfileImage}
            />

            {/* ==================================================
              MENU ITEMS
            ================================================== */}

            <ProfileDetails onPressMenu={handleMenuPress} />

            {/* ==================================================
              LOG OUT
            ================================================== */}

            <LogoutButton onPress={handleLogout} />

            {/* Space for bottom navigation */}

            <View style={{ height: 100 }} />
          </ScrollView>
        </TabContent>

        {/* ==================================================
            BOTTOM NAVIGATION
        ================================================== */}

        <BottomNavbar activeTab="profile" />
      </View>
    </SafeAreaView>
  );
}

/* ==========================================================
   RESPONSIVE STYLES
========================================================== */

const createStyles = (scale: number, width: number) =>
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
  });