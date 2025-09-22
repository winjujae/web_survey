import type { User } from "../../types/auth";
import { apiRequest } from "@/lib/api";
import type { components } from "@/types/generated/openapi";

type BackendUser = components["schemas"]["User"]; // from OpenAPI

export type LoginPayload = { 
  email: string; 
  password: string;
  provider?: "email" | "google";
  googleId?: string;
  name?: string;
  picture?: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};

export type UpdateProfilePayload = {
  name?: string;
  bio?: string;
  email?: string;
};

export interface ILoginService {
  login(payload: LoginPayload): Promise<{ user: User; accessToken: string }>;
  register(payload: RegisterPayload): Promise<{ user: User; accessToken: string }>;
  logout(): Promise<void>;
  me(token: string): Promise<User | null>;
  forgotPassword(email: string): Promise<void>;
  updateProfile(payload: UpdateProfilePayload): Promise<User>;
}

function transformUser(u: any): User {
  const bu = u as Partial<BackendUser> | undefined;
  return {
    id: String(bu?.user_id ?? ""),
    handle: bu?.nickname ? `@${bu.nickname}` : "@user",
    name: String((bu as any)?.name ?? bu?.nickname ?? "사용자"),
    email: (bu as any)?.email,
    avatar: (bu as any)?.avatar_url,
    picture: (bu as any)?.avatar_url,
    provider: (bu as any)?.provider as any,
    nickname: (bu as any)?.nickname,
    bio: (bu as any)?.bio,
    role: (bu as any)?.role as any,
  };
}

export const apiAuthService: ILoginService = {
  async login(payload) {
    const res = await apiRequest(`/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    });
    // 서버는 Set-Cookie만 수행하고 { success: true }를 반환하도록 구성됨
    // 이후 me로 사용자 정보를 조회
    const user = await this.me("");
    if (!user) throw new Error('로그인 실패');
    return { user, accessToken: "" };
  },
  async register(payload) {
    const res = await apiRequest(`/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const user = await this.me("");
    if (!user) throw new Error('회원가입 실패');
    return { user, accessToken: "" };
  },
  async logout() {
    await apiRequest(`/api/auth/logout`, { method: 'POST' });
  },
  async me(_token: string) {
    try {
      const result = await apiRequest(`/api/auth/session`, { method: 'GET' });
      if (result?.authenticated && result?.user) return transformUser(result.user);
      return null;
    } catch {
      return null;
    }
  },
  async forgotPassword(email: string) {
    // 백엔드 엔드포인트 준비 시 교체
    return;
  },
  async updateProfile(payload) {
    const res = await apiRequest(`/api/auth/profile`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return transformUser(res);
  },
};