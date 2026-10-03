import { ApiError, request } from "./api";
import { getToken, setToken } from "./token-storage";
import type { LoginResponse, User, VerifyOtpResponse } from "@/types/auth";

/**
 * Sign in with an email or UM ID. The token is persisted immediately because
 * the follow up OTP call is authenticated with it.
 */
export async function signIn(
  login: string,
  password: string,
): Promise<LoginResponse> {
  const result = await request<LoginResponse>("/login", {
    method: "POST",
    body: { login, password },
  });

  await setToken(result.token);

  return result;
}

export async function submitOtp(otp: string): Promise<VerifyOtpResponse> {
  return request<VerifyOtpResponse>("/verify-otp", {
    method: "POST",
    body: { otp },
    token: await getToken(),
  });
}

export async function resendOtp(): Promise<{ email: string }> {
  return request<{ email: string }>("/resend-otp", {
    method: "POST",
    token: await getToken(),
  });
}

export async function signOut(): Promise<void> {
  const token = await getToken();

  try {
    await request("/logout", { method: "POST", token });
  } catch {
    // The credential may already be gone; dropping it locally is enough.
  }

  await setToken(null);
}

/**
 * Re-read the account behind the stored token so a relaunched app shows
 * current server data rather than a snapshot from the last sign in.
 */
export async function fetchMe(): Promise<User | null> {
  const token = await getToken();
  if (!token) {
    return null;
  }

  try {
    const result = await request<{ user: User }>("/me", { token });
    return result.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await setToken(null);
      return null;
    }

    throw error;
  }
}
