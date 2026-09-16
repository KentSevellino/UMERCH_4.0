import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const { width, height } = useWindowDimensions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width, height);

  const handleLogin = () => {
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

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Umindanao Email address"
              placeholderTextColor="#B8B5B5"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#B8B5B5"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={Math.round(21 * scale)}
                color="#777777"
              />
            </TouchableOpacity>
          </View>

          {/* Remember Me */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && (
                  <Ionicons
                    name="checkmark"
                    size={Math.round(15 * scale)}
                    color="#FFFFFF"
                  />
                )}
              </View>

              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* OR Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.orText}>or</Text>

            <View style={styles.divider} />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.googleLogo}>G</Text>

            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
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

    /* =========================
       INPUTS
    ========================= */

    inputContainer: {
      height: Math.round(54 * scale),

      backgroundColor: "#EDEAEA",
      borderRadius: Math.round(12 * scale),

      marginBottom: Math.round(14 * scale),

      justifyContent: "center",
    },

    input: {
      flex: 1,

      paddingHorizontal: Math.round(17 * scale),

      fontSize: Math.round(15 * scale),
      color: "#333333",

      minHeight: Math.round(54 * scale),
    },

    passwordInput: {
      flex: 1,

      paddingLeft: Math.round(17 * scale),
      paddingRight: Math.round(50 * scale),

      fontSize: Math.round(15 * scale),
      color: "#333333",

      minHeight: Math.round(54 * scale),
    },

    eyeButton: {
      position: "absolute",

      right: Math.round(8 * scale),

      width: Math.round(42 * scale),
      height: Math.round(54 * scale),

      justifyContent: "center",
      alignItems: "center",
    },

    /* =========================
       REMEMBER / FORGOT
    ========================= */

    optionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",

      marginTop: Math.round(3 * scale),
    },

    rememberContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    checkbox: {
      width: Math.round(20 * scale),
      height: Math.round(20 * scale),

      borderWidth: 1,
      borderColor: "#AFAFAF",

      backgroundColor: "#FFFFFF",

      borderRadius: 3,

      justifyContent: "center",
      alignItems: "center",

      marginRight: Math.round(8 * scale),
    },

    checkboxChecked: {
      backgroundColor: "#B00000",
      borderColor: "#B00000",
    },

    rememberText: {
      fontSize: Math.round(13 * scale),
      color: "#333333",
      fontWeight: "500",
    },

    forgotPassword: {
      fontSize: Math.round(13 * scale),
      fontWeight: "700",
      color: "#B00000",
    },

    /* =========================
       DIVIDER
    ========================= */

    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",

      marginTop: Math.round(27 * scale),
      marginBottom: Math.round(15 * scale),
    },

    divider: {
      flex: 1,

      height: 1,

      backgroundColor: "#DDDDDD",
    },

    orText: {
      fontSize: Math.round(12 * scale),

      color: "#999999",

      marginHorizontal: Math.round(12 * scale),
    },

    /* =========================
       GOOGLE BUTTON
    ========================= */

    googleButton: {
      height: Math.round(50 * scale),

      backgroundColor: "#EDEDED",

      borderRadius: Math.round(26 * scale),

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.18,
      shadowRadius: 3,

      elevation: 3,
    },

    googleLogo: {
      fontSize: Math.round(17 * scale),

      fontWeight: "800",

      color: "#4285F4",

      marginRight: Math.round(8 * scale),
    },

    googleText: {
      fontSize: Math.round(14 * scale),

      fontWeight: "700",

      color: "#222222",
    },

    /* =========================
       SIGN IN BUTTON
    ========================= */

    bottomContainer: {
      flex: 1,

      justifyContent: "flex-end",

      marginTop: Math.round(80 * scale),
    },

    signInButton: {
      height: Math.round(52 * scale),

      borderRadius: Math.round(27 * scale),

      backgroundColor: "#B00000",

      justifyContent: "center",
      alignItems: "center",

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.25,
      shadowRadius: 3,

      elevation: 4,
    },

    signInText: {
      color: "#FFFFFF",

      fontSize: Math.round(15 * scale),

      fontWeight: "700",
    },
  });