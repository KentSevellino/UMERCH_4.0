import { AuthenticationProgressModal } from "@/components/auth/AuthenticationProgressModal";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/context/AuthContext";
import {
    clearCredentials,
    saveCredentials,
} from "@/services/credentialStorage";
import { Ionicons } from "@expo/vector-icons";
import {
  configureGoogleSignIn,
  isGoogleSignInCancelled,
  isGoogleSignInInProgress,
  isGoogleSignInSupported,
  isPlayServicesUnavailable,
  performGoogleSignIn,
} from "@/services/googleAuth";
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

const DEFAULT_GOOGLE_CLIENT_ID =
  "807615072659-0bavaq1nkcqi5og6lr46npgv180128hm.apps.googleusercontent.com";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressStatus, setProgressStatus] = useState<"loading" | "success">(
    "loading",
  );

  const webClientId =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    DEFAULT_GOOGLE_CLIENT_ID;

  useEffect(() => {
    configureGoogleSignIn(webClientId);
  }, [webClientId]);

  const { width, height } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width, height);

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
            setIsSubmitting(false);
            router.replace(result.otp_required ? "/otp" : "/home");
          }, 900);
        }),
      )
      .catch((error: Error) => {
        setIsSubmitting(false);
        Alert.alert("Sign in failed", error.message);
      });
  };

  const handleForgotPassword = () => {
    console.log("Forgot password");
  };

  const handleGoogleLogin = async () => {
    if (!isGoogleSignInSupported()) {
      Alert.alert(
        "Google Sign-In Unavailable",
        "Google Sign-In requires a custom development build and is not supported in Expo Go.\n\nTo test Google Sign-In, run 'npm run android' (or 'npx expo run:android') to build the native client.",
      );
      return;
    }

    try {
      setProgressStatus("loading");
      setIsSubmitting(true);

      const { idToken, accessToken } = await performGoogleSignIn();

      if (!idToken && !accessToken) {
        setIsSubmitting(false);
        Alert.alert(
          "Google sign-in failed",
          "Google did not return an authentication token.",
        );
        return;
      }

      const result = await loginWithGoogle(idToken ?? undefined, accessToken);
      setProgressStatus("success");
      setTimeout(() => {
        setIsSubmitting(false);
        router.replace(result.otp_required ? "/otp" : "/home");
      }, 900);
    } catch (error: any) {
      setIsSubmitting(false);
      if (isGoogleSignInCancelled(error) || isGoogleSignInInProgress(error)) {
        return;
      }
      if (isPlayServicesUnavailable(error)) {
        Alert.alert(
          "Play Services Unavailable",
          "Google Play Services is not available or needs to be updated.",
        );
        return;
      }
      Alert.alert("Google sign-in failed", error?.message || "An unknown error occurred.");
    }
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
            loading={isSubmitting}
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
