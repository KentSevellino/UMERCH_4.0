import * as ImagePicker from "expo-image-picker";

const STORAGE_KEY_PREFIX = "umerch.profileAvatar.";
const DEFAULT_STORAGE_KEY = "umerch.profileAvatar";

type AvatarChangeListener = (userKey: string, uri: string) => void;
const listeners = new Set<AvatarChangeListener>();

export function subscribeToAvatarChanges(
  listener: AvatarChangeListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyAvatarChanged(userKey: string, uri: string) {
  listeners.forEach((fn) => {
    try {
      fn(userKey, uri);
    } catch (e) {
      console.warn("Avatar change listener failed:", e);
    }
  });
}

function sanitizeKey(key: string | number): string {
  return String(key).replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function loadProfileImage(
  userKey?: string | number | null,
): Promise<string | null> {
  if (!userKey) return null;
  const sanitized = sanitizeKey(userKey);
  try {
    return (
      localStorage.getItem(`${STORAGE_KEY_PREFIX}${sanitized}`) ||
      localStorage.getItem(DEFAULT_STORAGE_KEY)
    );
  } catch {
    return null;
  }
}

export async function pickAndStoreProfileImage(
  userKey?: string | number | null,
): Promise<string | null> {
  if (!userKey) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const picked = result.assets[0];
  const dataUrl = picked.base64
    ? `data:image/jpeg;base64,${picked.base64}`
    : picked.uri;

  const sanitized = sanitizeKey(userKey);

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${sanitized}`, dataUrl);
    localStorage.setItem(DEFAULT_STORAGE_KEY, dataUrl);
  } catch {
    // Storage quota may be exceeded; fall back to the in-memory uri.
  }

  notifyAvatarChanged(sanitized, dataUrl);

  return dataUrl;
}