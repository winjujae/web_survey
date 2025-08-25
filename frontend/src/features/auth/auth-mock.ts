// src/features/auth/auth-mock.ts
import { ILoginService, LoginPayload } from "./auth-service";
import type { User } from "../../types/auth";

// email → handle/name 유틸
function fromEmail(email: string): Pick<User, "handle" | "name"> {
  const handle = email.split("@")[0] || "user";
  const name = handle.charAt(0).toUpperCase() + handle.slice(1);
  return { handle, name };
}
// token ↔ handle 인코딩
const TOKEN_PREFIX = "mock-";

export const mockAuthService: ILoginService = {
  async login(payload: LoginPayload) {
    const { email, password } = payload;
    if (!email || !password) throw new Error("이메일/비밀번호를 입력하세요.");

    const { handle, name } = fromEmail(email);
    const user: User = { id: "u-" + handle, handle, name };

    // 토큰에 handle을 심어두면 새로고침 후 me()에서 복원 가능
    const accessToken = TOKEN_PREFIX + handle;
    return { user, accessToken };
  },

  async logout() {
    // 서버 호출 없으면 비워둬도 됨
    return;
  },

  async me(token: string) {
    if (!token?.startsWith(TOKEN_PREFIX)) return null;
    const handle = token.slice(TOKEN_PREFIX.length);
    const name = handle.charAt(0).toUpperCase() + handle.slice(1);
    const user: User = { id: "u-" + handle, handle, name };
    return user;
  },
};
