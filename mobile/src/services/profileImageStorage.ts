import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

const PROFILE_DIRECTORY = "ProfileImages";
const PROFILE_FILE_NAME = "profile-avatar.jpg";

function profileDirectory(): Directory {
  const directory = new Directory(Paths.document, PROFILE_DIRECTORY);

  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }

  return directory;
}

function profileFile(): File {
  return new File(profileDirectory(), PROFILE_FILE_NAME);
}

export async function loadProfileImage(): Promise<string | null> {
  try {
    const file = profileFile();

    return file.exists ? file.uri : null;
  } catch {
    return null;
  }
}

export async function pickAndStoreProfileImage(): Promise<string | null> {
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
    const destination = profileFile();

    await source.copy(destination, { overwrite: true });

    return destination.uri;
  } catch {
    return picked.uri;
  }
}