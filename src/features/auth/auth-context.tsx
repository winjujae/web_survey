import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "../../types/auth";
import type { ILoginService, LoginPayload } from "./auth-service";
import { mockAuthService } from "./auth-mock";

const AUTH_KEY = "auth.token";

type AuthState = { user: User | null; token: string | null; loading: boolean };
type Ctx = AuthState & {
  login: (p: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  service: ILoginService;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const service: ILoginService = mockAuthService; // 나중에 실제 API로 교체
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  useEffect(() => {
    const t = localStorage.getItem(AUTH_KEY);
    if (!t) return setState(s => ({ ...s, loading: false }));
    service.me(t).then(u => setState({ user: u, token: u ? t : null, loading: false }));
  }, []);

  const login = async (p: LoginPayload) => {
    const { user, accessToken } = await service.login(p);
    localStorage.setItem(AUTH_KEY, accessToken);
    setState({ user, token: accessToken, loading: false });
  };

  const logout = async () => {
    await service.logout();
    localStorage.removeItem(AUTH_KEY);
    setState({ user: null, token: null, loading: false });
  };

  const value = useMemo(() => ({ ...state, login, logout, service }), [state]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
// AuthProvider를 앱 최상단에 배치 필요
// 예: <AuthProvider><App /></AuthProvider>