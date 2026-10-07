import { TabContent } from "@/components/common/TabContent";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { ProfileDetails } from "@/components/profile/ProfileDetails";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { useAuth } from "@/context/AuthContext";
import { useProfileImage } from "@/hooks/useProfileImage";
import { router } from "expo-router";
import {
    Alert,
    ScrollView,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getUserProfileDetails,
  identifyRoleFromEmail,
} from "@/services/userProfileStorage";
import { useEffect, useState } from "react";

export default function Profile() {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 390, 0.9), 1.12);

  const styles = createStyles(scale, width);

  const { user, logout } = useAuth();
  const { avatarUri, changeProfileImage } = useProfileImage();
  const [nickname, setNickname] = useState("");
  const role = identifyRoleFromEmail(user?.email);

  const userKey = user?.id ?? user?.email ?? null;

  useEffect(() => {
    if (userKey) {
      getUserProfileDetails(userKey).then((details) => {
        setNickname(details.nickname || "");
      });
    } else {
      setNickname("");
    }
  }, [userKey]);

  const displayName =
    nickname.trim() ||
    user?.user_fullname ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "User";

  const handleMenuPress = (id: string) => {
    switch (id) {
      case "personal":
        router.push("/personal-information");
        break;

      case "orders":
        router.push("/orders");
        break;

      default:
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } finally {
              router.replace("/login");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        {/* ==================================================
            HEADER
        ================================================== */}

        <ProfileHeader scale={scale} />

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
              name={displayName}
              role={role}
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
