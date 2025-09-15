// src/features/auth/auth-mock.ts
import { ILoginService, LoginPayload, RegisterPayload } from "./auth-service";
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
    const { email, password, provider = "email", name, picture } = payload;
    
    if (provider === "google") {
      // 구글 로그인 처리
      if (!email) throw new Error("구글 계정 정보가 없습니다.");
      
      const { handle } = fromEmail(email);
      const user: User = { 
        id: "u-" + handle, 
        handle, 
        name: name || handle,
        email,
        picture,
        provider: "google"
      };
      
      const accessToken = TOKEN_PREFIX + handle + "-google";
      return { user, accessToken };
    } else {
      // 일반 로그인 처리
      if (!email || !password) throw new Error("이메일/비밀번호를 입력하세요.");

      const { handle, name: defaultName } = fromEmail(email);
      const user: User = { 
        id: "u-" + handle, 
        handle, 
        name: name || defaultName,
        email,
        provider: "email"
      };

      const accessToken = TOKEN_PREFIX + handle;
      return { user, accessToken };
    }
  },

  async register(payload: RegisterPayload) {
    const { email, password, name } = payload;
    if (!email || !password || !name) {
      throw new Error("모든 필드를 입력해주세요.");
    }

    // 간단한 유효성 검사
    if (password.length < 6) {
      throw new Error("비밀번호는 최소 6자 이상이어야 합니다.");
    }

    const { handle } = fromEmail(email);
    const user: User = { 
      id: "u-" + handle, 
      handle, 
      name,
      email,
      provider: "email"
    };

    const accessToken = TOKEN_PREFIX + handle;
    return { user, accessToken };
  },

  async logout() {
    // 서버 호출 없으면 비워둬도 됨
    return;
  },

  async me(token: string) {
    if (!token?.startsWith(TOKEN_PREFIX)) return null;
    
    const isGoogleToken = token.includes("-google");
    const handle = token.slice(TOKEN_PREFIX.length).replace("-google", "");
    const name = handle.charAt(0).toUpperCase() + handle.slice(1);
    
    const user: User = { 
      id: "u-" + handle, 
      handle, 
      name,
      email: handle + "@example.com",
      provider: isGoogleToken ? "google" : "email"
    };
    return user;
  },

  async forgotPassword(email: string) {
    if (!email) throw new Error("이메일을 입력해주세요.");
    
    // Mock 응답
    console.log(`비밀번호 재설정 이메일을 ${email}로 발송했습니다.`);
    return;
  },
};
