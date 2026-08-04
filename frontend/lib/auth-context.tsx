'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, authApi, LoginPayload, RegisterPayload } from './api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from sessionStorage on mount
    const stored = sessionStorage.getItem('farmstand_token');
    const storedUser = sessionStorage.getItem('farmstand_user');
    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  function persistSession(authUser: AuthUser) {
    sessionStorage.setItem('farmstand_token', authUser.accessToken);
    sessionStorage.setItem('farmstand_user', JSON.stringify(authUser));
    setToken(authUser.accessToken);
    setUser(authUser);
  }

  async function login(data: LoginPayload) {
    const res = await authApi.login(data);
    persistSession(res);
  }

  async function register(data: RegisterPayload) {
    const res = await authApi.register(data);
    persistSession(res);
  }

  function logout() {
    authApi.logout();
    sessionStorage.removeItem('farmstand_token');
    sessionStorage.removeItem('farmstand_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}