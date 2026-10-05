import * as ImagePicker from "expo-image-picker";

const STORAGE_KEY = "umerch.profileAvatar";

export async function loadProfileImage(): Promise<string | null> {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function pickAndStoreProfileImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });

  if (result.canceled) {
    return null;
  }

  const picked = result.assets[0];

  const dataUrl = picked.base64
    ? `data:image/jpeg;base64,${picked.base64}`
    : picked.uri;

  try {
    localStorage.setItem(STORAGE_KEY, dataUrl);
  } catch {
    // Storage quota may be exceeded; fall back to the in-memory uri.
  }

  return dataUrl;
}