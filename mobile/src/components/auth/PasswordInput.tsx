import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

type PasswordInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function PasswordInput({
  value,
  onChangeText,
  placeholder = "Password",
}: PasswordInputProps) {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 375, 0.9), 1.15);

  const styles = createStyles(scale);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.passwordInput}
        placeholder={placeholder}
        placeholderTextColor="#B8B5B5"
        value={value}
        onChangeText={onChangeText}
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
  );
}

const createStyles = (scale: number) =>
  StyleSheet.create({
    inputContainer: {
      height: Math.round(54 * scale),

      backgroundColor: "#EDEAEA",
      borderRadius: Math.round(12 * scale),

      marginBottom: Math.round(14 * scale),

      justifyContent: "center",
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
  });