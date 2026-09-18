import { LoginForm } from "@/components/auth/LoginForm";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const { width, height } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width, height);

  const handleLogin = (email: string, password: string) => {
    console.log("Email:", email);
    console.log("Password:", password);

    router.replace("/tabs");
  };

  const handleForgotPassword = () => {
    console.log("Forgot password");
  };

  const handleGoogleLogin = () => {
    console.log("Google login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={Math.round(25 * scale)}
              color="#222222"
            />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome</Text>

            <Text style={styles.subtitle}>
              Please enter your email & password to sign in
            </Text>
          </View>

          <LoginForm
            onLogin={handleLogin}
            onForgotPassword={handleForgotPassword}
            onGoogleLogin={handleGoogleLogin}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (scale: number, width: number, height: number) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#F7F7F7",
    },

    keyboardView: {
      flex: 1,
    },

    container: {
      flexGrow: 1,

      paddingHorizontal: Math.max(24, Math.min(width * 0.075, 32)),

      paddingTop: Math.max(10, height * 0.015),
      paddingBottom: 24,
    },

    /* =========================
       BACK BUTTON
    ========================= */

    backButton: {
      width: 44,
      height: 44,

      justifyContent: "center",
      alignItems: "flex-start",

      marginBottom: Math.round(22 * scale),
    },

    /* =========================
       HEADER
    ========================= */

    header: {
      marginBottom: Math.round(28 * scale),
    },

    title: {
      fontSize: Math.round(30 * scale),
      lineHeight: Math.round(36 * scale),

      fontWeight: "900",
      color: "#B00000",

      marginBottom: Math.round(7 * scale),
    },

    subtitle: {
      fontSize: Math.round(14 * scale),
      lineHeight: Math.round(20 * scale),

      fontWeight: "500",
      color: "#333333",
    },
  });