import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
<<<<<<< HEAD
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
=======
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OtpScreen() {
  const { maskedEmail, verifyOtp, resendOtp } = useAuth();
  const { width } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(32);

  const scale = Math.min(Math.max(width / 390, 0.9), 1.12);

  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const handleVerify = () => {
    if (!/^\d{6}$/.test(otp)) {
      Alert.alert("Invalid code", "Enter the 6-digit code sent to your email.");
      return;
    }

    Keyboard.dismiss();
    setIsSubmitting(true);
    verifyOtp(otp)
      .then(() => router.replace("/home"))
      .catch((error: Error) => {
        setIsSubmitting(false);
        Alert.alert("Verification failed", error.message);
      });
  };

  const handleResend = () => {
    if (secondsRemaining > 0) return;

    void resendOtp()
      .then(() => {
        setOtp("");
        setSecondsRemaining(32);
        inputRef.current?.focus();
      })
      .catch((error: Error) =>
        Alert.alert("Could not resend code", error.message),
      );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={25} color="#222222" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={[styles.title, { fontSize: Math.round(25 * scale) }]}>
            OTP code verification
          </Text>
          <Text style={styles.subtitle}>
            Please check your email address and write the OTP code you received
            {maskedEmail ? ` at ${maskedEmail}` : " here"}.
          </Text>

          <TouchableOpacity
            style={styles.otpRow}
            onPress={() => inputRef.current?.focus()}
            activeOpacity={1}
          >
            {Array.from({ length: 6 }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  otp[index] && styles.otpBoxFilled,
                  index === otp.length && styles.otpBoxActive,
                ]}
              >
                <Text style={styles.otpText}>{otp[index] ?? ""}</Text>
              </View>
            ))}
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={(value) =>
              setOtp(value.replace(/\D/g, "").slice(0, 6))
            }
            onSubmitEditing={handleVerify}
            keyboardType="number-pad"
            maxLength={6}
            textContentType="oneTimeCode"
            autoFocus
            caretHidden
            style={styles.hiddenInput}
          />

          <Text style={styles.resendPrompt}>
            Didn&apos;t receive mail?{" "}
            <Text
              style={[
                styles.resendLink,
                secondsRemaining > 0 && styles.resendDisabled,
              ]}
              onPress={handleResend}
            >
              Resend OTP
            </Text>
          </Text>
          <Text style={styles.timerText}>
            You can resend code in{" "}
            <Text style={styles.timer}>{secondsRemaining}s</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </Text>
        </TouchableOpacity>
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

<<<<<<< HEAD
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
=======
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F7F7" },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  content: { flex: 1 },
  title: {
    color: "#B00000",
    lineHeight: 31,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    maxWidth: 340,
    color: "#333333",
    fontSize: 13,
    lineHeight: 19,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  otpBox: {
    width: 43,
    height: 43,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDEAEA",
  },
  otpBoxFilled: { backgroundColor: "#E4E1E1" },
  otpBoxActive: { borderWidth: 1.5, borderColor: "#B00000" },
  otpText: { color: "#222222", fontSize: 20, fontWeight: "600" },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  resendPrompt: {
    marginTop: 64,
    color: "#333333",
    fontSize: 12,
    textAlign: "center",
  },
  resendLink: { color: "#B00000", fontWeight: "700" },
  resendDisabled: { opacity: 0.45 },
  timerText: {
    marginTop: 14,
    color: "#333333",
    fontSize: 12,
    textAlign: "center",
  },
  timer: { color: "#B00000", fontWeight: "700" },
  button: {
    height: 52,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#B00000",
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
