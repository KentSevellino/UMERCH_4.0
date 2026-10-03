const TOKEN_KEY = "umerch.auth.token";

export async function getToken(): Promise<string | null> {
  return globalThis.localStorage.getItem(TOKEN_KEY);
}

export async function setToken(value: string | null): Promise<void> {
  if (value === null) {
    globalThis.localStorage.removeItem(TOKEN_KEY);
    return;
  }

  globalThis.localStorage.setItem(TOKEN_KEY, value);
}
