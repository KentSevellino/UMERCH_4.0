/**
 * Safe wrapper around @react-native-google-signin/google-signin.
 *
 * @react-native-google-signin/google-signin depends on native modules (RNGoogleSignin)
 * that are NOT included in standard Expo Go or Expo Web. Attempting to statically
 * import it throws a TurboModuleRegistry error on app startup.
 *
 * By dynamically requiring the library inside a try/catch, this wrapper allows the app
 * to run normally in Expo Go / Web while providing full functionality when running in
 * a native development build (expo run:android / expo run:ios).
 */

type GoogleSigninPackage = typeof import("@react-native-google-signin/google-signin");

let GoogleSigninModule: GoogleSigninPackage | null = null;
let isNativeModuleAvailable = false;

try {
  // Evaluated at runtime so absence of native binary doesn't crash app startup
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  GoogleSigninModule = require("@react-native-google-signin/google-signin");
  isNativeModuleAvailable = Boolean(GoogleSigninModule?.GoogleSignin);
} catch {
  isNativeModuleAvailable = false;
  GoogleSigninModule = null;
}

export function isGoogleSignInSupported(): boolean {
  return isNativeModuleAvailable && Boolean(GoogleSigninModule?.GoogleSignin);
}

export function configureGoogleSignIn(webClientId: string): void {
  if (!isGoogleSignInSupported() || !GoogleSigninModule) {
    return;
  }
  try {
    GoogleSigninModule.GoogleSignin.configure({
      webClientId,
    });
  } catch (e) {
    console.warn("Failed to configure GoogleSignin:", e);
  }
}

export async function signOutGoogle(): Promise<void> {
  if (!isGoogleSignInSupported() || !GoogleSigninModule) {
    return;
  }
  try {
    await GoogleSigninModule.GoogleSignin.signOut();
  } catch {
    // Safe to ignore if no user was signed in or play services is absent
  }
}

export interface GoogleTokens {
  idToken?: string;
  accessToken?: string;
}

export async function performGoogleSignIn(): Promise<GoogleTokens> {
  if (!isGoogleSignInSupported() || !GoogleSigninModule) {
    throw new Error(
      "Google Sign-In is not supported in Expo Go. Please run the project with a development build (npx expo run:android or npx expo run:ios).",
    );
  }

  const { GoogleSignin } = GoogleSigninModule;

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  // Clear any cached Google session so Google Play Services always prompts the account picker
  try {
    await GoogleSignin.signOut();
  } catch {
    // Safe to ignore
  }

  const response = await GoogleSignin.signIn();

  let idToken: string | null | undefined;
  let accessToken: string | undefined;

  if (response && "data" in response && response.data) {
    idToken = response.data.idToken;
  } else if (response && "idToken" in response) {
    idToken = (response as any).idToken;
  }

  if (!idToken) {
    const tokens = await GoogleSignin.getTokens();
    idToken = tokens.idToken;
    accessToken = tokens.accessToken;
  }

  return {
    idToken: idToken ?? undefined,
    accessToken,
  };
}

export function isGoogleSignInCancelled(error: any): boolean {
  const code = error?.code;
  const statusCodes = GoogleSigninModule?.statusCodes;
  return (
    code === "SIGN_IN_CANCELLED" ||
    code === "12501" ||
    (statusCodes ? code === statusCodes.SIGN_IN_CANCELLED : false)
  );
}

export function isGoogleSignInInProgress(error: any): boolean {
  const code = error?.code;
  const statusCodes = GoogleSigninModule?.statusCodes;
  return (
    code === "IN_PROGRESS" ||
    code === "ASYNC_OP_IN_PROGRESS" ||
    (statusCodes ? code === statusCodes.IN_PROGRESS : false)
  );
}

export function isPlayServicesUnavailable(error: any): boolean {
  const code = error?.code;
  const statusCodes = GoogleSigninModule?.statusCodes;
  return (
    code === "PLAY_SERVICES_NOT_AVAILABLE" ||
    (statusCodes ? code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE : false)
  );
}
