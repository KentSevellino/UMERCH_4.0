import { SIGN_IN_MESSAGES, safeSignInErrorCode } from './signInErrors';

export function oauthErrorFromUrl(): string {
  const oauthError = new URLSearchParams(window.location.search).get('error');
  return oauthError ? SIGN_IN_MESSAGES[safeSignInErrorCode(oauthError)] : '';
}

export function rememberOauthOrigin(origin: 'landing' | 'login'): void {
  localStorage.setItem('oauth_from', origin);
}

export function takeOauthOrigin(): 'landing' | 'login' {
  const origin = localStorage.getItem('oauth_from');
  localStorage.removeItem('oauth_from');
  return origin === 'landing' ? 'landing' : 'login';
}
