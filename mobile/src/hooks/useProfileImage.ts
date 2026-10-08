import { useAuth } from "@/context/AuthContext";
import {
  loadProfileImage,
  pickAndStoreProfileImage,
  subscribeToAvatarChanges,
} from "@/services/profileImageStorage";
import { useCallback, useEffect, useState } from "react";

function sanitizeKey(key: string | number): string {
  return String(key).replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function useProfileImage(customUserKey?: string | number) {
  const { user } = useAuth();
  const userKey = customUserKey ?? user?.id ?? user?.email ?? null;
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!userKey) {
      setAvatarUri(null);
      return;
    }

    const sanitizedKey = sanitizeKey(userKey);

    loadProfileImage(userKey).then((saved) => {
      if (mounted) {
        setAvatarUri(saved);
      }
    });

    const unsubscribe = subscribeToAvatarChanges((changedKey, newUri) => {
      if (mounted && changedKey === sanitizedKey) {
        setAvatarUri(newUri);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [userKey]);

  const changeProfileImage = useCallback(async () => {
    if (!userKey) return;
    const uri = await pickAndStoreProfileImage(userKey);

    if (uri) {
      setAvatarUri(uri);
    }
  }, [userKey]);

  return { avatarUri, changeProfileImage };
}
