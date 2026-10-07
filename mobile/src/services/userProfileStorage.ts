import * as SecureStore from "expo-secure-store";

export type UserRole = "STUDENT" | "TEACHER" | "CUSTOMER";

export type UserProfileDetails = {
  department: string;
  nickname: string;
};

/**
 * Automatically identifies user role from their email address:
 * - umindanao.edu.ph with a 6-digit number (e.g. k.sevellino.545000@umindanao.edu.ph) -> STUDENT
 * - umindanao.edu.ph without a 6-digit number (e.g. mbuisan@umindanao.edu.ph) -> TEACHER
 * - Non-umindanao email (e.g. kentsevellino11@gmail.com) -> CUSTOMER
 */
export function identifyRoleFromEmail(email?: string | null): UserRole {
  if (!email) return "CUSTOMER";
  const normalized = email.trim().toLowerCase();

  if (
    normalized.includes("umindanao.edu.ph") ||
    normalized.includes("umindanao.edu")
  ) {
    const username = normalized.split("@")[0] || "";
    // Check if the username contains a 6-digit number (student ID)
    if (/\d{6}/.test(username)) {
      return "STUDENT";
    }
    return "TEACHER";
  }

  return "CUSTOMER";
}

/**
 * Backward-compatibility alias that delegates to email-based role identification.
 */
export const resolveUserRole = (
  _backendRole?: string | null,
  email?: string | null,
  _savedRole?: unknown,
): UserRole => identifyRoleFromEmail(email);

const KEY_PREFIX = "umerch.profile.details.";

function sanitizeKey(key: string | number): string {
  return String(key).replace(/[^a-zA-Z0-9_.-]/g, "_");
}

export async function getUserProfileDetails(
  userKey: string | number,
): Promise<UserProfileDetails> {
  try {
    const raw = await SecureStore.getItemAsync(
      `${KEY_PREFIX}${sanitizeKey(userKey)}`,
    );
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        department: parsed.department ?? "",
        nickname: parsed.nickname ?? "",
      };
    }
  } catch {
    // Return empty defaults on read error
  }

  return {
    department: "",
    nickname: "",
  };
}

export async function saveUserProfileDetails(
  userKey: string | number,
  details: Partial<UserProfileDetails>,
): Promise<void> {
  try {
    const current = await getUserProfileDetails(userKey);
    const updated = { ...current, ...details };
    await SecureStore.setItemAsync(
      `${KEY_PREFIX}${sanitizeKey(userKey)}`,
      JSON.stringify(updated),
    );
  } catch {
    // Silently ignore storage errors
  }
}
