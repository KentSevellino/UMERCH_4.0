import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: number;
  um_id: number;
  email: string;
  user_fullname: string;
  role: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (login: string, password: string, deviceFingerprint?: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  resendOtp: () => Promise<{ email: string }>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

interface LoginResponse {
  user: User;
  token: string;
  redirect?: string;
  otp_required?: boolean;
  otp_verified?: boolean;
  email?: string;
  message?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setIsLoading(false);
  }, []);

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, []);

  const handleSetUser = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, []);

  const login = useCallback(async (loginStr: string, password: string, deviceFingerprint?: string): Promise<LoginResponse> => {
    const response = await api.post('/login', {
      login: loginStr,
      password,
      device_fingerprint: deviceFingerprint,
    });
    const data = response.data;

    if (data.token) {
      setToken(data.token);
    }
    if (data.user) {
      handleSetUser(data.user);
    }

    return data;
  }, [setToken, handleSetUser]);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch {
      // Continue even if API call fails
    } finally {
      setToken(null);
      handleSetUser(null);
      window.location.href = '/login';
    }
  }, [setToken, handleSetUser]);

  const verifyOtp = useCallback(async (otp: string) => {
    const response = await api.post('/verify-otp', { otp });
    return response.data;
  }, []);

  const resendOtp = useCallback(async (): Promise<{ email: string }> => {
    const response = await api.post('/resend-otp');
    return response.data;
  }, []);

  const isAuthenticated = !!user && !!token;
  const isAdmin = isAuthenticated && user?.role === 'Admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        logout,
        verifyOtp,
        resendOtp,
        setUser: handleSetUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
