import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "umerch.auth.token";

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(value: string | null): Promise<void> {
  if (value === null) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, value);
}
