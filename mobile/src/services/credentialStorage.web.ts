const EMAIL_KEY = "umerch.login.email";
const PASSWORD_KEY = "umerch.login.password";

export async function getSavedCredentials(): Promise<{
  email: string;
  password: string;
} | null> {
  const email = globalThis.localStorage.getItem(EMAIL_KEY);
  const password = globalThis.localStorage.getItem(PASSWORD_KEY);
  return email && password ? { email, password } : null;
}

export async function saveCredentials(email: string, password: string) {
  globalThis.localStorage.setItem(EMAIL_KEY, email);
  globalThis.localStorage.setItem(PASSWORD_KEY, password);
}

export async function clearCredentials() {
  globalThis.localStorage.removeItem(EMAIL_KEY);
  globalThis.localStorage.removeItem(PASSWORD_KEY);
}
