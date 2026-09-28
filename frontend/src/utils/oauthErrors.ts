export const GOOGLE_ERRORS: Record<string, string> = {
  no_account: 'No account found for this email. Please contact your admin.',
  inactive: 'Your account has been deactivated. Please contact an administrator.',
  google_failed: 'Google sign-in failed. Please try again.',
  google_email: 'Your Google account did not provide an email address.',
};

export function oauthErrorFromUrl(): string {
  const oauthError = new URLSearchParams(window.location.search).get('error');
  return oauthError ? (GOOGLE_ERRORS[oauthError] ?? oauthError) : '';
}

export function rememberOauthOrigin(origin: 'landing' | 'login'): void {
  localStorage.setItem('oauth_from', origin);
}

export function takeOauthOrigin(): 'landing' | 'login' {
  const origin = localStorage.getItem('oauth_from');
  localStorage.removeItem('oauth_from');
  return origin === 'landing' ? 'landing' : 'login';
}
