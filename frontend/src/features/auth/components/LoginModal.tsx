//src/features/auth/components/LoginModal.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth-context";

type AuthMode = "login" | "register" | "forgot";

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, register, forgotPassword } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => { e.preventDefault(); onClose(); }; // ESC
    el.addEventListener("cancel", onCancel);
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
    return () => el.removeEventListener("cancel", onCancel);
  }, [open, onClose]);

  // 모드 변경 시 상태 리셋
  useEffect(() => {
    setErr("");
    setSuccess("");
    setPw("");
    setConfirmPw("");
    if (mode !== "register") setName("");
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email, password: pw });
        onClose();
      } else if (mode === "register") {
        if (pw !== confirmPw) {
          throw new Error("비밀번호가 일치하지 않습니다.");
        }
        if (pw.length < 6) {
          throw new Error("비밀번호는 최소 6자 이상이어야 합니다.");
        }
        await register({ email, password: pw, name });
        setSuccess("회원가입이 완료되었습니다!");
        onClose();
      } else if (mode === "forgot") {
        await forgotPassword(email);
        setSuccess("비밀번호 재설정 링크를 이메일로 발송했습니다.");
      }
    } catch (e: any) {
      setErr(e.message ?? "요청 처리에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Passport OAuth 로그인으로 리다이렉트
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300';
    window.location.href = `${apiUrl}/api/auth/google/login`;
  };

  const handleKakaoLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300';
    window.location.href = `${apiUrl}/api/auth/kakao/login`;
  };

  const getTitle = () => {
    switch (mode) {
      case "login": return "로그인";
      case "register": return "회원가입";
      case "forgot": return "비밀번호 찾기";
    }
  };

  const getSubmitButtonText = () => {
    if (loading) {
      switch (mode) {
        case "login": return "로그인 중...";
        case "register": return "가입 중...";
        case "forgot": return "전송 중...";
      }
    }
    switch (mode) {
      case "login": return "로그인";
      case "register": return "회원가입";
      case "forgot": return "재설정 링크 발송";
    }
  };

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-modal="true"
      aria-labelledby="authTitle"
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ minWidth: 400, maxWidth: 500 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 id="authTitle" style={{ marginBottom: 8 }}>{getTitle()}</h2>
          <p style={{ color: "#666", fontSize: 14 }}>
            {mode === "login" && "자라머니 탈모 커뮤니티에 오신 것을 환영합니다"}
            {mode === "register" && "새 계정을 만들어 커뮤니티에 참여하세요"}
            {mode === "forgot" && "가입 시 사용한 이메일을 입력해주세요"}
          </p>
        </div>

        {err && (
          <div style={{ 
            background: "#fef2f2", 
            border: "1px solid #fecaca", 
            borderRadius: 8, 
            padding: 12, 
            marginBottom: 16,
            color: "#dc2626"
          }}>
            {err}
          </div>
        )}

        {success && (
          <div style={{ 
            background: "#f0fdf4", 
            border: "1px solid #bbf7d0", 
            borderRadius: 8, 
            padding: 12, 
            marginBottom: 16,
            color: "#16a34a"
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                이름
              </label>
              <input 
                type="text"
                className="input"
                placeholder="실명 또는 닉네임"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
              이메일
            </label>
            <input 
              type="email"
              className="input"
              placeholder="example@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus={mode !== "register"}
              style={{ width: "100%" }}
            />
          </div>

          {mode !== "forgot" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                비밀번호
              </label>
              <input 
                type="password"
                className="input"
                placeholder="최소 6자 이상"
                value={pw}
                onChange={e => setPw(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </div>
          )}

          {mode === "register" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                비밀번호 확인
              </label>
              <input 
                type="password"
                className="input"
                placeholder="비밀번호를 다시 입력해주세요"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", marginBottom: 16 }}
          >
            {getSubmitButtonText()}
          </button>
        </form>

        {mode === "login" && (
          <>
            <div style={{ position: "relative", textAlign: "center", marginBottom: 16 }}>
              <hr style={{ border: "none", borderTop: "1px solid #e5e7eb" }} />
              <span style={{ 
                position: "absolute", 
                top: -10, 
                left: "50%", 
                transform: "translateX(-50%)",
                background: "white",
                padding: "0 12px",
                fontSize: 14,
                color: "#666"
              }}>
                또는
              </span>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="btn"
              style={{ 
                width: "100%", 
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                border: "1px solid #d1d5db"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 로그인
            </button>

            <button
              type="button"
              onClick={handleKakaoLogin}
              className="btn"
              style={{
                width: "100%",
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "#FEE500",
                color: "#191600",
                border: "1px solid #e5e7eb"
              }}
            >
              {/* 간단한 말풍선 아이콘 */}
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                <path fill="#191600" d="M12 3C6.477 3 2 6.686 2 11c0 2.208 1.148 4.2 2.996 5.62-.121 1.106-.56 2.53-1.72 3.705-.218.221-.057.603.247.603 1.66-.06 3.073-.59 4.112-1.13C9.03 20.268 10.48 20.5 12 20.5c5.523 0 10-3.686 10-8.5S17.523 3 12 3Z"/>
              </svg>
              카카오로 로그인
            </button>
          </>
        )}

        <div style={{ textAlign: "center", fontSize: 14 }}>
          {mode === "login" && (
            <>
              <button 
                type="button" 
                onClick={() => setMode("register")}
                style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}
              >
                회원가입
              </button>
              <span style={{ margin: "0 8px", color: "#d1d5db" }}>|</span>
              <button 
                type="button" 
                onClick={() => setMode("forgot")}
                style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}
              >
                비밀번호 찾기
              </button>
            </>
          )}

          {mode === "register" && (
            <>
              이미 계정이 있으신가요?{" "}
              <button 
                type="button" 
                onClick={() => setMode("login")}
                style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}
              >
                로그인
              </button>
            </>
          )}

          {mode === "forgot" && (
            <>
              <button 
                type="button" 
                onClick={() => setMode("login")}
                style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}
              >
                로그인으로 돌아가기
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "#666"
          }}
          aria-label="닫기"
        >
          ×
        </button>
      </div>
    </dialog>
  );
}
