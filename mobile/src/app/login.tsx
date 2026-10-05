import { AuthenticationProgressModal } from "@/components/auth/AuthenticationProgressModal";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/context/AuthContext";
<<<<<<< HEAD
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
=======
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
import {
  clearCredentials,
  saveCredentials,
} from "@/services/credentialStorage";
import { Ionicons } from "@expo/vector-icons";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
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
  const { login, loginWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressStatus, setProgressStatus] = useState<"loading" | "success">(
    "loading",
  );
  const googleClientIds = {
    android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  };
  const googleClientId =
    Platform.OS === "android"
      ? googleClientIds.android
      : Platform.OS === "ios"
        ? googleClientIds.ios
        : googleClientIds.web;
  const isGoogleConfigured = Boolean(googleClientId);
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      googleClientIds.android || "missing-google-android-client-id",
    iosClientId: googleClientIds.ios || "missing-google-ios-client-id",
    webClientId: googleClientIds.web || "missing-google-web-client-id",
    scopes: ["openid", "profile", "email"],
    redirectUri: makeRedirectUri({ scheme: "umerchapp", path: "oauth" }),
  });

  useEffect(() => {
    if (response && response.type !== "success") {
      setIsSubmitting(false);
    }
    if (response?.type !== "success") return;
    const idToken =
      response.authentication?.idToken ?? response.params?.id_token;
    if (!idToken) {
      Alert.alert(
        "Google sign-in failed",
        "Google did not return an ID token.",
      );
      return;
    }

    setIsSubmitting(true);
    loginWithGoogle(idToken)
      .then((result) => {
        setProgressStatus("success");
        setTimeout(() => {
          router.replace(result.otp_required ? "/otp" : "/home");
        }, 900);
      })
      .catch((error: Error) => {
        setIsSubmitting(false);
        Alert.alert("Google sign-in failed", error.message);
      });
  }, [response, loginWithGoogle]);
  const { width, height } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width, height);

<<<<<<< HEAD
  const { login } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setSubmitting(true);

    try {
      const result = await login(email.trim(), password);

      if (result.otp_required) {
        router.replace("/otp");
        return;
      }

      router.replace("/tabs");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sign in failed. Try again."
      );
    } finally {
      setSubmitting(false);
    }
=======
  const handleLogin = (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => {
    if (!email || !password) {
      Alert.alert(
        "Missing details",
        "Enter your email and password to continue.",
      );
      return;
    }

    setIsSubmitting(true);
    login(email, password)
      .then((result) =>
        (rememberMe
          ? saveCredentials(email, password)
          : clearCredentials()
        ).then(() => {
          setProgressStatus("success");
          setTimeout(() => {
            router.replace(result.otp_required ? "/otp" : "/home");
          }, 900);
        }),
      )
      .catch((error: Error) => {
        setIsSubmitting(false);
        Alert.alert("Sign in failed", error.message);
      });
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
  };

  const handleForgotPassword = () => {
    console.log("Forgot password");
  };

  const handleGoogleLogin = () => {
    if (!isGoogleConfigured || !request) {
      Alert.alert(
        "Google sign-in unavailable",
        "Google sign-in is not configured yet.",
      );
      return;
    }
    setProgressStatus("loading");
    setIsSubmitting(true);
    void promptAsync();
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
<<<<<<< HEAD
            loading={submitting}
            error={error}
=======
            isSubmitting={isSubmitting}
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <AuthenticationProgressModal
        visible={isSubmitting}
        status={progressStatus}
      />
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
