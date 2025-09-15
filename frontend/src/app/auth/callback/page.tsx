// src/app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const error = searchParams.get("message");

        if (error) {
          setStatus("error");
          setMessage(decodeURIComponent(error));
          return;
        }

        // 서버가 이미 쿠키를 설정했으므로, withCredentials로 프로필 호출
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300'}/api/auth/profile`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          
          // auth context 업데이트 (실제 사용자 정보로)
          setStatus("success");
          setMessage("로그인 성공! 메인 페이지로 이동합니다.");
          
          // 1초 후 메인 페이지로 이동
          setTimeout(() => {
            // URL에서 토큰 파라미터를 완전히 제거하고 메인 페이지로 이동
            window.location.href = "/";
          }, 1000);
        } else {
          throw new Error("사용자 정보를 가져올 수 없습니다.");
        }
      } catch (error) {
        console.error("인증 콜백 처리 실패:", error);
        setStatus("error");
        setMessage("인증 처리 중 오류가 발생했습니다.");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  const handleRetry = () => {
    router.push("/");
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "100vh",
      padding: "20px",
      textAlign: "center"
    }}>
      {status === "loading" && (
        <>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px"
          }} />
          <h2>로그인 처리 중...</h2>
          <p>잠시만 기다려주세요.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            backgroundColor: "#4CAF50",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            color: "white",
            fontSize: "20px"
          }}>
            ✓
          </div>
          <h2 style={{ color: "#4CAF50" }}>로그인 성공!</h2>
          <p>{message}</p>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            backgroundColor: "#f44336",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            color: "white",
            fontSize: "20px"
          }}>
            ✗
          </div>
          <h2 style={{ color: "#f44336" }}>로그인 실패</h2>
          <p>{message}</p>
          <button 
            onClick={handleRetry}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            다시 시도
          </button>
        </>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
