// src/features/auth/google-auth.ts

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void;
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleInitConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleButtonConfig {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: string;
  locale?: string;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

class GoogleAuthService {
  private static instance: GoogleAuthService;
  private isInitialized = false;
  private clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Google Auth는 브라우저에서만 사용할 수 있습니다."));
        return;
      }

      if (!this.clientId) {
        reject(new Error("Google Client ID가 설정되지 않았습니다."));
        return;
      }

      // Google Identity Script 로드
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: this.clientId,
            callback: this.handleCredentialResponse.bind(this),
          });
          this.isInitialized = true;
          resolve();
        } else {
          reject(new Error("Google Identity Services 로드에 실패했습니다."));
        }
      };

      script.onerror = () => {
        reject(new Error("Google Identity Services 스크립트 로드에 실패했습니다."));
      };

      document.head.appendChild(script);
    });
  }

  private handleCredentialResponse(response: GoogleCredentialResponse) {
    // JWT 토큰을 파싱하여 사용자 정보 추출
    try {
      const userInfo = this.parseJWT(response.credential);
      this.onGoogleLoginSuccess(userInfo);
    } catch (error) {
      console.error("Google 로그인 처리 실패:", error);
      this.onGoogleLoginError(error as Error);
    }
  }

  private parseJWT(token: string): GoogleUserInfo {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error("JWT 토큰 파싱에 실패했습니다.");
    }
  }

  async signIn(): Promise<GoogleUserInfo> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      this.onGoogleLoginSuccess = resolve;
      this.onGoogleLoginError = reject;

      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt();
      } else {
        reject(new Error("Google Identity Services가 초기화되지 않았습니다."));
      }
    });
  }

  renderButton(element: HTMLElement, config: GoogleButtonConfig = {}): void {
    if (!this.isInitialized) {
      console.error("Google Auth가 초기화되지 않았습니다.");
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(element, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: "100%",
        ...config,
      });
    }
  }

  // 콜백 함수들 (Promise에서 사용)
  private onGoogleLoginSuccess: (userInfo: GoogleUserInfo) => void = () => {};
  private onGoogleLoginError: (error: Error) => void = () => {};
}

export default GoogleAuthService;
export type { GoogleUserInfo, GoogleButtonConfig };
