import { GoogleButton } from "@/components/auth/GoogleButton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

type LoginFormProps = {
  onLogin: (email: string, password: string) => void;
  onForgotPassword: () => void;
  onGoogleLogin: () => void;
};

export function LoginForm({
  onLogin,
  onForgotPassword,
  onGoogleLogin,
}: LoginFormProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <>
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
      <PasswordInput value={password} onChangeText={setPassword} />

      {/* Remember Me */}
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.rememberContainer}
          onPress={() => setRememberMe(!rememberMe)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
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

        <TouchableOpacity onPress={onForgotPassword} activeOpacity={0.7}>
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
      <GoogleButton onPress={onGoogleLogin} />

      {/* Sign In Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => {
            onLogin(email, password);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const createStyles = (scale: number) =>
  StyleSheet.create({
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