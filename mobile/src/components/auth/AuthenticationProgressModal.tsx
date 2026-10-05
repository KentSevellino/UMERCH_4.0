import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, View } from "react-native";

type AuthenticationProgressModalProps = {
  visible: boolean;
  status: "loading" | "success";
  message?: string;
};

export function AuthenticationProgressModal({
  visible,
  status,
  message,
}: AuthenticationProgressModalProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== "loading") return;

    rotation.setValue(0);
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();
    return () => animation.stop();
  }, [rotation, status]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          {status === "success" ? (
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={52} color="#FFFFFF" />
            </View>
          ) : (
            <Animated.View
              style={[styles.spinner, { transform: [{ rotate: spin }] }]}
            />
          )}

          <Text style={styles.title}>
            {status === "success" ? "Had very little!" : "Signing you in"}
          </Text>
          <Text style={styles.subtitle}>
            {message ??
              (status === "success"
                ? "You will be directed to authentication shortly"
                : "Please wait while we verify your account")}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },
  modal: {
    width: "72%",
    minHeight: 220,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  successIcon: {
    width: 72,
    height: 72,
    marginBottom: 18,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#B00000",
  },
  spinner: {
    width: 44,
    height: 44,
    marginBottom: 28,
    borderRadius: 22,
    borderWidth: 6,
    borderColor: "#E9C7C7",
    borderTopColor: "#B00000",
  },
  title: {
    color: "#B00000",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    maxWidth: 220,
    marginTop: 10,
    color: "#C8C8C8",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
