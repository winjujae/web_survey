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
    // 쿠키 기반으로 서버 세션/토큰이 이미 설정되어 있다고 가정하고 me를 호출
    service.me("")
      .then(u => setState({ user: u, token: null, loading: false }))
      .catch(() => setState({ user: null, token: null, loading: false }));
  }, []);

  const login = async (p: LoginPayload) => {
    const { user } = await service.login(p);
    setState({ user, token: null, loading: false });
  };

  const register = async (p: RegisterPayload) => {
    const { user } = await service.register(p);
    setState({ user, token: null, loading: false });
  };

  const logout = async () => {
    await service.logout();
    setState({ user: null, token: null, loading: false });
  };

  const forgotPassword = async (email: string) => {
    await service.forgotPassword(email);
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
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
