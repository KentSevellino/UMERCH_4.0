import { useCallback, useEffect, useState } from "react";

import {
    loadProfileImage,
    pickAndStoreProfileImage,
} from "@/services/profileImageStorage";

export function useProfileImage() {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    loadProfileImage().then((saved) => {
      if (mounted) {
        setAvatarUri(saved);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const changeProfileImage = useCallback(async () => {
    const uri = await pickAndStoreProfileImage();

    if (uri) {
      setAvatarUri(uri);
    }
  }, []);

  return { avatarUri, changeProfileImage };
}
