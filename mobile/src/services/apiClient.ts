import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;
const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];
const androidApiHost = Device.isDevice ? expoHost : "10.0.2.2";

export const API_URL = configuredApiUrl
  ? Platform.OS === "android"
    ? configuredApiUrl.replace(
        /^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/,
        (_match, protocol: string) => `${protocol}${androidApiHost}`,
      )
    : configuredApiUrl
  : Platform.OS === "android"
    ? "http://10.0.2.2:8000/api"
    : "http://localhost:8000/api";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

/**
 * Thin fetch wrapper so every call shares the base URL, the JSON contract and
 * the bearer token. Errors are normalised into ApiError so callers can branch
 * on `status` instead of sniffing response bodies.
 */
export async function request<T>(
  path: string,
  { method = "GET", body, token }: RequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      `Could not reach the server at ${API_URL}. Start the backend and set EXPO_PUBLIC_API_URL for this device.`,
      0,
    );
  }

  const text = await response.text();

  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : `Request failed (${response.status})`;

    throw new ApiError(message, response.status);
  }

  return data as T;
}
