///src/features/auth/auth-context.tsx
"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@/types/auth";
import type { ILoginService, LoginPayload, RegisterPayload, UpdateProfilePayload } from "./auth-service";
import { mockAuthService } from "./auth-mock";

const AUTH_KEY = "auth.token";

type AuthState = { user: User | null; token: string | null; loading: boolean };
type Ctx = AuthState & {
  login: (p: LoginPayload) => Promise<void>;
  register: (p: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (p: UpdateProfilePayload) => Promise<void>;
  service: ILoginService;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const service: ILoginService = mockAuthService; // TODO: 실제 API로 교체
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem(AUTH_KEY) : null;
    if (!t) return setState(s => ({ ...s, loading: false }));
    service.me(t)
      .then(u => setState({ user: u, token: u ? t : null, loading: false }))
      .catch(() => setState({ user: null, token: null, loading: false }));
  }, []);

  const login = async (p: LoginPayload) => {
    const { user, accessToken } = await service.login(p);
    localStorage.setItem(AUTH_KEY, accessToken);
    setState({ user, token: accessToken, loading: false });
  };

  const register = async (p: RegisterPayload) => {
    const { user, accessToken } = await service.register(p);
    localStorage.setItem(AUTH_KEY, accessToken);
    setState({ user, token: accessToken, loading: false });
  };

  const logout = async () => {
    await service.logout();
    localStorage.removeItem(AUTH_KEY);
    setState({ user: null, token: null, loading: false });
  };

  const forgotPassword = async (email: string) => {
    await service.forgotPassword(email);
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    if (!state.token) throw new Error("로그인이 필요합니다.");
    const updatedUser = await service.updateProfile(payload);
    setState(prev => ({ ...prev, user: updatedUser }));
  };

  const value = useMemo(() => ({ ...state, login, register, logout, forgotPassword, updateProfile, service }), [state]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
