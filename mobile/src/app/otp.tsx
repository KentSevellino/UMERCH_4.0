import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
