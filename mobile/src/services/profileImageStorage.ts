import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

const PROFILE_DIRECTORY = "ProfileImages";

function sanitizeKey(key: string | number): string {
  return String(key).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function profileDirectory(): Directory {
  const directory = new Directory(Paths.document, PROFILE_DIRECTORY);

  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }

  return directory;
}

function profileFile(userKey: string | number = "default"): File {
  const fileName = `profile-avatar-${sanitizeKey(userKey)}.jpg`;
  return new File(profileDirectory(), fileName);
}

export async function loadProfileImage(
  userKey?: string | number | null,
): Promise<string | null> {
  if (!userKey) return null;
  try {
    const file = profileFile(userKey);

    return file.exists ? file.uri : null;
  } catch {
    return null;
  }
}

export async function pickAndStoreProfileImage(
  userKey?: string | number | null,
): Promise<string | null> {
  if (!userKey) return null;
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  const picked = result.assets[0];

  try {
    const source = new File(picked.uri);
    const destination = profileFile(userKey);

    await source.copy(destination, { overwrite: true });

    return destination.uri;
  } catch {
    return picked.uri;
  }
}