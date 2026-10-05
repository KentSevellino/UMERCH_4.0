import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
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

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function OtpScreen() {
  const { width, height } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale, width, height);

  const { maskedEmail, verifyOtp, resendOtp } = useAuth();

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }

        return current - 1;
      });
    }, 1000);
  };

  const handleVerify = async () => {
    if (code.length !== OTP_LENGTH || verifying) return;

    setError(null);
    setVerifying(true);

    try {
      await verifyOtp(code);
      router.replace("/tabs");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Verification failed. Try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resending || cooldown > 0) return;

    setError(null);
    setResending(true);

    try {
      await resendOtp();
      setCode("");
      startCooldown();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not resend the code."
      );
    } finally {
      setResending(false);
    }
  };

  const canSubmit = code.length === OTP_LENGTH && !verifying;

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
            onPress={() => router.replace("/login")}
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
            <Text style={styles.title}>Verification Code</Text>

            <Text style={styles.subtitle}>
              Enter the 6-digit code we sent to
              {maskedEmail ? ` ${maskedEmail}` : " your email"}
            </Text>
          </View>

          {/* Code Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={(value) => {
                setError(null);
                setCode(value.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH));
              }}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              maxLength={OTP_LENGTH}
              placeholder="000000"
              placeholderTextColor="#B8B5B5"
              returnKeyType="done"
              onSubmitEditing={handleVerify}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
            onPress={handleVerify}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {verifying ? "Verifying…" : "Verify"}
            </Text>
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendHint}>{`Didn't get the code?`}</Text>

            <TouchableOpacity
              onPress={handleResend}
              disabled={resending || cooldown > 0}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.resendLink,
                  (resending || cooldown > 0) && styles.resendLinkDisabled,
                ]}
              >
                {cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : resending
                    ? "Sending…"
                    : "Resend code"}
              </Text>
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
      marginBottom: Math.round(30 * scale),
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
       CODE INPUT
    ========================= */

    inputContainer: {
      height: Math.round(64 * scale),

      backgroundColor: "#EDEAEA",
      borderRadius: Math.round(12 * scale),

      marginBottom: Math.round(16 * scale),

      justifyContent: "center",
    },

    input: {
      flex: 1,

      paddingHorizontal: Math.round(17 * scale),

      fontSize: Math.round(26 * scale),
      letterSpacing: Math.round(8 * scale),

      color: "#222222",
      fontWeight: "800",

      textAlign: "center",

      minHeight: Math.round(64 * scale),
    },

    errorText: {
      color: "#B00000",

      fontSize: Math.round(13 * scale),
      lineHeight: Math.round(18 * scale),
      fontWeight: "600",

      textAlign: "center",

      marginBottom: Math.round(12 * scale),
    },

    /* =========================
       BUTTONS
    ========================= */

    primaryButton: {
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

    primaryButtonDisabled: {
      backgroundColor: "#D08A8A",
    },

    primaryButtonText: {
      color: "#FFFFFF",

      fontSize: Math.round(15 * scale),

      fontWeight: "700",
    },

    /* =========================
       RESEND
    ========================= */

    resendRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",

      gap: Math.round(6 * scale),

      marginTop: Math.round(24 * scale),
    },

    resendHint: {
      fontSize: Math.round(13 * scale),
      fontWeight: "500",
      color: "#575757",
    },

    resendLink: {
      fontSize: Math.round(13 * scale),
      fontWeight: "700",
      color: "#B00000",
    },

    resendLinkDisabled: {
      color: "#AFAFAF",
    },
  });
