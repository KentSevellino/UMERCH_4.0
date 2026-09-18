import { StyleSheet, View, useWindowDimensions } from "react-native";

import {
  ProfileButton,
  ProfileButtonData,
} from "./ProfileButton";

export const PROFILE_DETAILS_ITEMS: ProfileButtonData[] = [
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

type ProfileDetailsProps = {
  onPressMenu: (id: string) => void;
};

export function ProfileDetails({ onPressMenu }: ProfileDetailsProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 390, 0.9), 1.12);

  const styles = createStyles(scale);

  return (
    <View style={styles.menuContainer}>
      {PROFILE_DETAILS_ITEMS.map((item) => (
        <ProfileButton
          key={item.id}
          item={item}
          onPress={() => {
            onPressMenu(item.id);
          }}
        />
      ))}
    </View>
  );
}

const createStyles = (scale: number) =>
  StyleSheet.create({
    menuContainer: {
      marginTop: Math.round(22 * scale),

      gap: Math.round(15 * scale),
    },
  });