export const SIGN_IN_MESSAGES = {
  sign_in_failed: 'Unable to sign in right now. Please try again.',
  invalid_credentials: 'The provided credentials do not match our records.',
  inactive: 'Your account has been deactivated. Please contact an administrator.',
  login_required: 'Enter your email or UM ID.',
  password_required: 'Enter your password.',
  invalid_details: 'Please check your sign-in details and try again.',
  session_expired: 'Session expired. Please refresh and try again.',
  rate_limited: 'Too many sign-in attempts. Please try again shortly.',
  network_error: 'Could not connect. Please check your internet connection and try again.',
  no_account: 'No account found for this email. Please contact your admin.',
  google_failed: 'Google sign-in failed. Please try again.',
  google_email: 'Your Google account did not provide an email address.',
  link_expired: 'This sign-in link is invalid or has expired. Please try again.',
  account_unavailable: 'Your account is not available. Please contact an administrator.',
  session_failed: 'Your browser session could not be started. Please try signing in again.',
} as const;

export type SignInErrorCode = keyof typeof SIGN_IN_MESSAGES;

interface SignInError {
  code: SignInErrorCode;
  message: string;
  retryAfter?: number;
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

export function safeSignInErrorCode(value: unknown): SignInErrorCode {
  return typeof value === 'string' && Object.hasOwn(SIGN_IN_MESSAGES, value)
    ? value as SignInErrorCode
    : 'google_failed';
}

// Only exact, known authentication responses may select user-facing copy.
// Never return text from an exception or an arbitrary server response.
const KNOWN_MESSAGES = new Map<string, SignInErrorCode>([
  [SIGN_IN_MESSAGES.invalid_credentials, 'invalid_credentials'],
  [SIGN_IN_MESSAGES.inactive, 'inactive'],
  [SIGN_IN_MESSAGES.link_expired, 'link_expired'],
  [SIGN_IN_MESSAGES.account_unavailable, 'account_unavailable'],
  [SIGN_IN_MESSAGES.session_failed, 'session_failed'],
  ['The login field is required.', 'login_required'],
  ['The password field is required.', 'password_required'],
]);

export function formatSignInError(error: unknown): SignInError {
  const failure = record(error);
  const response = record(failure?.response);
  const status = response?.status;
  const data = record(response?.data);
  const result = (code: SignInErrorCode): SignInError => ({ code, message: SIGN_IN_MESSAGES[code] });

  if (!response) {
    return result(['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'].includes(String(failure?.code))
      ? 'network_error'
      : 'sign_in_failed');
  }
  if (typeof status !== 'number' || status >= 500) return result('sign_in_failed');
  if (status === 419) return result('session_expired');
  if (status === 429) {
    const retryAfter = data?.retry_after;
    return {
      ...result('rate_limited'),
      ...(typeof retryAfter === 'number' && Number.isFinite(retryAfter) && retryAfter > 0
        ? { retryAfter: Math.ceil(retryAfter) }
        : {}),
    };
  }
  if (![400, 401, 403, 422].includes(status)) return result('sign_in_failed');

  const knownMessage = typeof data?.message === 'string' ? KNOWN_MESSAGES.get(data.message) : undefined;
  if (knownMessage) return result(knownMessage);

  if (status === 422) {
    const errors = record(data?.errors);
    for (const field of ['login', 'password']) {
      const values = errors?.[field];
      for (const value of Array.isArray(values) ? values : [values]) {
        const code = typeof value === 'string' ? KNOWN_MESSAGES.get(value) : undefined;
        if (code) return result(code);
      }
    }
    return result('invalid_details');
  }
  return result('sign_in_failed');
}
