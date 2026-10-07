import {
  fetchMe,
  resendOtp,
  signIn,
  signInWithGoogle,
  signOut,
  submitOtp,
  updateProfile as apiUpdateProfile,
} from "@/services/authService";
import { clearCredentials } from "@/services/credentialStorage";
import type {
  LoginResponse,
  UpdateProfileInput,
  User,
  VerifyOtpResponse,
} from "@/types/auth";
import { signOutGoogle } from "@/services/googleAuth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthStatus =
  "loading" | "signedOut" | "otpRequired" | "authenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  /** Destination the backend masked for the OTP email, shown on the code screen. */
  maskedEmail: string | null;
  login: (login: string, password: string) => Promise<LoginResponse>;
  loginWithGoogle: (
    idToken?: string,
    accessToken?: string,
  ) => Promise<LoginResponse>;
  verifyOtp: (otp: string) => Promise<VerifyOtpResponse>;
  resendOtp: () => Promise<void>;
  updateUserProfile: (data: UpdateProfileInput) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchMe()
      .then((restored) => {
        if (cancelled) return;
        if (restored) {
          setUser(restored);
          setStatus("authenticated");
        } else {
          setStatus("signedOut");
        }
      })
      .catch(() => {
        // A stale or unreachable token should land the user back at sign in
        // rather than on a spinner forever.
        if (!cancelled) {
          setUser(null);
          setStatus("signedOut");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (loginValue: string, password: string) => {
    const result = await signIn(loginValue, password);

    setUser(result.user);

    if (result.otp_required) {
      setMaskedEmail(result.email ?? null);
      setStatus("otpRequired");
      return result;
    }

    setMaskedEmail(null);
    setStatus("authenticated");

    return result;
  }, []);

  const loginWithGoogle = useCallback(
    async (idToken?: string, accessToken?: string) => {
      const payload: { id_token?: string; access_token?: string } = {};
      if (idToken) payload.id_token = idToken;
      if (accessToken) payload.access_token = accessToken;

      const result = await signInWithGoogle(payload);

      setUser(result.user);

      if (result.otp_required) {
        setMaskedEmail(result.email ?? null);
        setStatus("otpRequired");
        return result;
      }

      setMaskedEmail(null);
      setStatus("authenticated");
      return result;
    },
    [],
  );

  const verifyOtp = useCallback(async (otp: string) => {
    const result = await submitOtp(otp);

    setMaskedEmail(null);
    setStatus("authenticated");

    return result;
  }, []);

  const handleResendOtp = useCallback(async () => {
    const result = await resendOtp();
    setMaskedEmail(result.email ?? null);
  }, []);

  const updateUserProfile = useCallback(async (data: UpdateProfileInput) => {
    const updated = await apiUpdateProfile(data);
    setUser(updated);
    return updated;
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOutGoogle();
    } catch {
      // Ignored if Google account wasn't used or device doesn't support play services
    }

    await signOut();
    await clearCredentials();

    setUser(null);
    setMaskedEmail(null);
    setStatus("signedOut");
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      maskedEmail,
      login,
      loginWithGoogle,
      verifyOtp,
      resendOtp: handleResendOtp,
      updateUserProfile,
      logout,
    }),
    [
      status,
      user,
      maskedEmail,
      login,
      loginWithGoogle,
      verifyOtp,
      handleResendOtp,
      updateUserProfile,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
