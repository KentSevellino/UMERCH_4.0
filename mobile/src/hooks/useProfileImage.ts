import { useAuth } from "@/context/AuthContext";
import {
    loadProfileImage,
    pickAndStoreProfileImage,
} from "@/services/profileImageStorage";
import { useCallback, useEffect, useState } from "react";

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

    loadProfileImage(userKey).then((saved) => {
      if (mounted) {
        setAvatarUri(saved);
      }
    });

    return () => {
      mounted = false;
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
