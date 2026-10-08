import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

const PROFILE_DIRECTORY = "ProfileImages";
const SECURE_STORE_PREFIX = "umerch.profile.avatar.";

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

function getProfileDirectoryUri(): string {
  const base = FileSystem.documentDirectory || "";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  return `${cleanBase}${PROFILE_DIRECTORY}`;
}

async function ensureProfileDirectory(): Promise<string> {
  const dirUri = getProfileDirectoryUri();
  try {
    const dirInfo = await FileSystem.getInfoAsync(dirUri);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
    }
  } catch (err) {
    console.warn("Could not ensure profile directory:", err);
  }
  return dirUri;
}

async function cleanupOldAvatars(
  userKey: string | number,
  keepUri?: string,
): Promise<void> {
  try {
    const dirUri = getProfileDirectoryUri();
    const dirInfo = await FileSystem.getInfoAsync(dirUri);
    if (!dirInfo.exists) return;

    const files = await FileSystem.readDirectoryAsync(dirUri);
    const prefix = `profile-avatar-${sanitizeKey(userKey)}`;

    for (const fileName of files) {
      if (fileName.startsWith(prefix)) {
        const fileUri = `${dirUri}/${fileName}`;
        if (fileUri !== keepUri) {
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
        }
      }
    }
  } catch {
    // Non-critical background cleanup
  }
}

export async function loadProfileImage(
  userKey?: string | number | null,
): Promise<string | null> {
  if (!userKey) return null;
  const sanitized = sanitizeKey(userKey);

  // 1. Check SecureStore for saved URI
  try {
    const storedUri = await SecureStore.getItemAsync(
      `${SECURE_STORE_PREFIX}${sanitized}`,
    );
    if (storedUri) {
      const info = await FileSystem.getInfoAsync(storedUri);
      if (info.exists) {
        return storedUri;
      }
    }
  } catch {
    // Fall back to scanning folder
  }

  // 2. Fall back to scanning ProfileImages directory for matching file
  try {
    const dirUri = getProfileDirectoryUri();
    const dirInfo = await FileSystem.getInfoAsync(dirUri);
    if (dirInfo.exists) {
      const files = await FileSystem.readDirectoryAsync(dirUri);
      const prefix = `profile-avatar-${sanitized}`;
      const matchingFiles = files
        .filter((f) => f.startsWith(prefix))
        .sort()
        .reverse();

      if (matchingFiles.length > 0) {
        const foundUri = `${dirUri}/${matchingFiles[0]}`;
        const check = await FileSystem.getInfoAsync(foundUri);
        if (check.exists) {
          await SecureStore.setItemAsync(
            `${SECURE_STORE_PREFIX}${sanitized}`,
            foundUri,
          ).catch(() => {});
          return foundUri;
        }
      }
    }
  } catch {
    // Fallback failed
  }

  return null;
}

export async function pickAndStoreProfileImage(
  userKey?: string | number | null,
): Promise<string | null> {
  if (!userKey) return null;

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      "Permission Required",
      "Please allow access to your photos to upload a profile picture.",
    );
    return null;
  }

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
  const sanitized = sanitizeKey(userKey);
  const timestamp = Date.now();
  const fileName = `profile-avatar-${sanitized}-${timestamp}.jpg`;

  try {
    const dirUri = await ensureProfileDirectory();
    const destinationUri = `${dirUri}/${fileName}`;

    let saved = false;

    // Strategy 1: Copy file from picked URI to destination in persistent documentDirectory
    try {
      await FileSystem.copyAsync({
        from: picked.uri,
        to: destinationUri,
      });
      const check = await FileSystem.getInfoAsync(destinationUri);
      if (check.exists && (check.size ?? 0) > 0) {
        saved = true;
      }
    } catch (copyErr) {
      console.warn("copyAsync failed, trying base64 fallback write:", copyErr);
    }

    // Strategy 2: If copyAsync failed and base64 is available, write directly to destination
    if (!saved && picked.base64) {
      try {
        await FileSystem.writeAsStringAsync(destinationUri, picked.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const check = await FileSystem.getInfoAsync(destinationUri);
        if (check.exists && (check.size ?? 0) > 0) {
          saved = true;
        }
      } catch (writeErr) {
        console.warn("writeAsStringAsync base64 fallback failed:", writeErr);
      }
    }

    if (!saved) {
      Alert.alert(
        "Upload Failed",
        "Could not save your new profile picture to device storage. Please try again.",
      );
      return null;
    }

    // Persist verified destination URI in SecureStore
    await SecureStore.setItemAsync(
      `${SECURE_STORE_PREFIX}${sanitized}`,
      destinationUri,
    );

    // Notify all active avatar hooks/screens immediately
    notifyAvatarChanged(sanitized, destinationUri);

    // Asynchronously delete older avatars for this user
    cleanupOldAvatars(userKey, destinationUri).catch(() => {});

    return destinationUri;
  } catch (error) {
    console.error("Failed to store profile image:", error);
    Alert.alert(
      "Upload Error",
      "An unexpected error occurred while saving your profile photo.",
    );
    return null;
  }
}