import React from "react";
import { View, StyleSheet } from "react-native";

import UmerchAnimation from "../components/animation/UmerchAnimation";

export default function Index() {
  return (
    <View style={styles.container}>
      <UmerchAnimation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
