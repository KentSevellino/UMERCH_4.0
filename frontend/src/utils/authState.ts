export type AuthStatus = 'loading' | 'guest' | 'pending' | 'verified';

export function authStatus(hasUser: boolean, hasToken: boolean, verified: boolean, loading: boolean): AuthStatus {
  if (loading) return 'loading';
  if (!hasUser || !hasToken) return 'guest';
  return verified ? 'verified' : 'pending';
}

export function protectedDestination(status: AuthStatus, adminOnly = false, isAdmin = false): string | null {
  if (status === 'pending') return '/authentication';
  if (status === 'guest') return '/login';
  if (status === 'verified' && adminOnly && !isAdmin) return '/Landing';
  return null;
}
