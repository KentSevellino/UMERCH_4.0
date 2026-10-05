import * as SecureStore from "expo-secure-store";

const EMAIL_KEY = "umerch.login.email";
const PASSWORD_KEY = "umerch.login.password";

export async function getSavedCredentials(): Promise<{
  email: string;
  password: string;
} | null> {
  const [email, password] = await Promise.all([
    SecureStore.getItemAsync(EMAIL_KEY),
    SecureStore.getItemAsync(PASSWORD_KEY),
  ]);

  return email && password ? { email, password } : null;
}

export async function saveCredentials(email: string, password: string) {
  await Promise.all([
    SecureStore.setItemAsync(EMAIL_KEY, email),
    SecureStore.setItemAsync(PASSWORD_KEY, password),
  ]);
}

export async function clearCredentials() {
  await Promise.all([
    SecureStore.deleteItemAsync(EMAIL_KEY),
    SecureStore.deleteItemAsync(PASSWORD_KEY),
  ]);
}
