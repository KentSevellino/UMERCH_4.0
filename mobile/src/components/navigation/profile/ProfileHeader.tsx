import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  scale?: number;
  notificationCount?: number;
};

export default function ProfileHeader({
  scale = 1,
  notificationCount = 2,
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

      {/* Logo + Title */}

      <View style={styles.left}>

        <Image
          source={require("../../../../assets/images/umerch-logo.png")}
          style={[
            styles.logo,
            {
              width: 45 * scale,
              height: 45 * scale,
            },
          ]}
          resizeMode="contain"
        />

        <Text
          style={[
            styles.title,
            {
              fontSize: 22 * scale,
            },
          ]}
        >
          Profile
        </Text>

      </View>

      {/* Notification */}

      <TouchableOpacity style={styles.notification}>

        <Ionicons
          name="notifications-outline"
          size={25 * scale}
          color="#FFFFFF"
        />

        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notificationCount}
            </Text>
          </View>
        )}

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

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    marginRight: 9,
  },

  title: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  notification: {
    width: 42,
    height: 42,

    justifyContent: "center",
    alignItems: "center",

    position: "relative",
  },

  badge: {
    position: "absolute",
    top: 0,
    right: 0,

    width: 18,
    height: 18,

    borderRadius: 9,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#B00000",
    fontSize: 9,
    fontWeight: "800",
  },
});