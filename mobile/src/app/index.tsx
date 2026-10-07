import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import UmerchAnimation from "../components/animation/UmerchAnimation";

export default function Index() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync("umerch.intro.seen")
      .then((seen) => {
        if (seen === "true") {
          router.replace("/login");
        } else {
          setReady(true);
        }
      })
      .catch(() => {
        setReady(true);
      });
  }, []);

  if (!ready) {
    return <View style={styles.container} />;
  }

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
