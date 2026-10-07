import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
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

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function OtpScreen() {
  const { width, height } = useWindowDimensions();
  const { maskedEmail, verifyOtp, resendOtp } = useAuth();
  const inputRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);
  const styles = createStyles(scale, width, height);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
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

    setVerifying(true);
    try {
      await verifyOtp(code);
      router.replace("/home");
    } catch (error) {
      Alert.alert(
        "Verification failed",
        error instanceof Error
          ? error.message
          : "Verification failed. Try again.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resending || cooldown > 0) return;

    setResending(true);
    try {
      await resendOtp();
      setCode("");
      inputRef.current?.focus();
      startCooldown();
    } catch (error) {
      Alert.alert(
        "Could not resend code",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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

        <View style={styles.content}>
          <Text style={styles.title}>OTP code verification</Text>
          <Text style={styles.subtitle}>
            Please check your email address and write the OTP code you received
            {maskedEmail ? ` at ${maskedEmail}` : " here"}.
          </Text>

          <View style={styles.codeInputContainer}>
            <TouchableOpacity
              style={styles.codeRow}
              onPress={() => inputRef.current?.focus()}
              activeOpacity={1}
            >
              {Array.from({ length: OTP_LENGTH }, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.codeBox,
                    index < code.length && styles.codeBoxFilled,
                    index === code.length && styles.codeBoxActive,
                  ]}
                >
                  <Text style={styles.codeText}>{code[index] ?? ""}</Text>
                </View>
              ))}
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={(value) =>
                setCode(value.replace(/\D/g, "").slice(0, OTP_LENGTH))
              }
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={OTP_LENGTH}
              autoFocus
              caretHidden
              style={styles.hiddenInput}
              onSubmitEditing={handleVerify}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.verifyButton,
              code.length !== OTP_LENGTH && styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            disabled={code.length !== OTP_LENGTH || verifying}
            activeOpacity={0.85}
          >
            <Text style={styles.verifyText}>
              {verifying ? "Verifying..." : "Verify OTP"}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendHint}>Didn't receive mail?</Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={resending || cooldown > 0}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.resendLink,
                  (resending || cooldown > 0) && styles.resendDisabled,
                ]}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
      paddingHorizontal: Math.max(24, Math.min(width * 0.075, 32)),
      paddingTop: Math.max(10, height * 0.015),
    },
    backButton: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "flex-start",
      marginBottom: Math.round(22 * scale),
    },
    content: {
      flex: 1,
      alignItems: "center",
    },
    title: {
      alignSelf: "stretch",
      color: "#B00000",
      fontSize: Math.round(25 * scale),
      fontWeight: "900",
      marginBottom: Math.round(10 * scale),
    },
    subtitle: {
      alignSelf: "stretch",
      color: "#222222",
      fontSize: Math.round(14 * scale),
      fontWeight: "600",
      lineHeight: Math.round(21 * scale),
      marginBottom: Math.round(28 * scale),
    },
    codeRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: Math.round(8 * scale),
    },
    codeInputContainer: {
      width: "100%",
      height: Math.round(50 * scale),
      position: "relative",
      marginBottom: Math.round(28 * scale),
    },
    codeBox: {
      width: Math.round(48 * scale),
      height: Math.round(50 * scale),
      borderRadius: Math.round(12 * scale),
      backgroundColor: "#EDEDED",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "transparent",
    },
    codeBoxFilled: {
      backgroundColor: "#FFFFFF",
    },
    codeBoxActive: {
      borderColor: "#B00000",
    },
    codeText: {
      color: "#222222",
      fontSize: Math.round(22 * scale),
      fontWeight: "700",
    },
    hiddenInput: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: Math.round(50 * scale),
      opacity: 0.02,
      zIndex: 2,
    },
    verifyButton: {
      alignSelf: "stretch",
      height: Math.round(52 * scale),
      borderRadius: Math.round(26 * scale),
      backgroundColor: "#B00000",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: Math.round(22 * scale),
    },
    buttonDisabled: {
      backgroundColor: "#C98B8B",
    },
    verifyText: {
      color: "#FFFFFF",
      fontSize: Math.round(16 * scale),
      fontWeight: "800",
    },
    resendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    resendHint: {
      color: "#333333",
      fontSize: Math.round(13 * scale),
    },
    resendLink: {
      color: "#B00000",
      fontSize: Math.round(13 * scale),
      fontWeight: "700",
    },
    resendDisabled: {
      color: "#999999",
    },
  });
