import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

type Props = {
  scale?: number;
  title?: string;
};

export default function ProfileHeader({ scale = 1, title = "Profile" }: Props) {
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
          source={require("../../../assets/images/umerch-logo.png")}
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
          {title}
        </Text>
      </View>
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
});
