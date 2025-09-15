import type { User } from "../../types/auth";

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
// 실제 API 서비스로 교체 필요
// 예: export const apiAuthService: ILoginService = { ... }