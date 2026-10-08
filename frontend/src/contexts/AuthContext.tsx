import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import api from '../services/api';
import { authStatus, type AuthStatus } from '../utils/authState';

interface User {
  id: number;
  um_id: number;
  email: string;
  user_fullname: string;
  role: string;
  status: string;
}

interface LoginResponse {
  user: User;
  token: string;
  redirect?: string;
  otp_required?: boolean;
  otp_verified?: boolean;
  email?: string;
}

interface VerificationResponse {
  otp_verified: boolean;
  redirect: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isPendingVerification: boolean;
  otpVerified: boolean;
  login: (login: string, password: string) => Promise<LoginResponse>;
  loginWithGoogleCode: (code: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<VerificationResponse>;
  resendOtp: () => Promise<{ email: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const revision = useRef(0);

  const saveLogin = useCallback((data: LoginResponse | null) => {
    revision.current++;
    setUser(data?.user ?? null);
    setToken(data?.token ?? null);
    setOtpVerified(data?.otp_verified === true && data?.otp_required !== true);
    setIsLoading(false);
    // The server, never a persisted flag or redirect, decides verification.
    localStorage.removeItem('otp_verified');
    if (data) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    delete api.defaults.headers.common.Authorization;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const startedAt = revision.current;
    const savedToken = localStorage.getItem('auth_token');
    const restore = async () => {
      try {
        if (!savedToken) {
          if (!cancelled && revision.current === startedAt) saveLogin(null);
          return;
        }
        const { data } = await api.get('/me');
        if (!cancelled && revision.current === startedAt) {
          saveLogin({ ...data, token: savedToken });
        }
      } catch {
        if (!cancelled && revision.current === startedAt) saveLogin(null);
      }
    };
    void restore();
    return () => { cancelled = true; };
  }, [saveLogin]);

  const login = useCallback(async (loginStr: string, password: string): Promise<LoginResponse> => {
    revision.current++;
    setOtpVerified(false);
    try {
      const { data } = await api.post('/login', { login: loginStr, password });
      saveLogin(data);
      return data;
    } catch (error) {
      saveLogin(null);
      throw error;
    }
  }, [saveLogin]);

  const loginWithGoogleCode = useCallback(async (code: string): Promise<LoginResponse> => {
    revision.current++;
    setOtpVerified(false);
    try {
      const { data } = await api.post('/auth/exchange', { code });
      saveLogin(data);
      return data;
    } catch (error) {
      saveLogin(null);
      throw error;
    }
  }, [saveLogin]);

  const logout = useCallback(async () => {
    // Keep the pending state available for retry if server cancellation fails.
    await api.post('/logout');
    saveLogin(null);
    window.location.href = '/Landing';
  }, [saveLogin]);

  const verifyOtp = useCallback(async (otp: string): Promise<VerificationResponse> => {
    const startedAt = revision.current;
    const { data } = await api.post('/verify-otp', { otp });
    if (revision.current === startedAt && data.otp_verified === true) {
      revision.current++;
      setOtpVerified(true);
    }
    return data;
  }, []);

  const resendOtp = useCallback(async (): Promise<{ email: string }> => {
    const { data } = await api.post('/resend-otp');
    return data;
  }, []);

  const status = authStatus(!!user, !!token, otpVerified, isLoading);
  const isAuthenticated = status === 'verified';
  const isAdmin = isAuthenticated && user?.role === 'Admin';

  return (
    <AuthContext.Provider value={{
      user, token, status, isAuthenticated, isAdmin, isLoading,
      isPendingVerification: status === 'pending', otpVerified,
      login, loginWithGoogleCode, logout, verifyOtp, resendOtp,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
