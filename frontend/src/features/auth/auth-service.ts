import type { User } from "../../types/auth";

export type LoginPayload = { email: string; password: string };

export interface ILoginService {
  login(payload: LoginPayload): Promise<{ user: User; accessToken: string }>;
  logout(): Promise<void>;
  me(token: string): Promise<User | null>;
}
// 실제 API 서비스로 교체 필요
// 예: export const apiAuthService: ILoginService = { ... }