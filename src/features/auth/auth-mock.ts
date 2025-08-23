import { ILoginService, LoginPayload } from "./auth-service";
import type { User } from "../../types/auth";

const you: User = { id: "u1", handle: "you", name: "You" };

export const mockAuthService: ILoginService = {
  async login(payload: LoginPayload) {
    if (!payload.email || !payload.password) throw new Error("이메일/비밀번호를 입력하세요.");
    return { user: you, accessToken: "mock-" + Math.random().toString(36).slice(2) };
  },
  async logout() { return; },
  async me(token: string) { return token?.startsWith("mock-") ? you : null; },
};
// 실제 API 서비스로 교체 필요
// 예: export const apiAuthService: ILoginService = { ... }