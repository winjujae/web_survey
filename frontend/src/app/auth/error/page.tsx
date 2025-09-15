// src/app/auth/error/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const errorMessage = searchParams.get("message") || "인증 중 오류가 발생했습니다.";

  const handleGoHome = () => {
    router.push("/");
  };

  const handleRetryLogin = () => {
    // 로그인 모달을 열거나 로그인 페이지로 이동
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
      <div style={{ 
        width: "80px", 
        height: "80px", 
        backgroundColor: "#f44336",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "30px",
        color: "white",
        fontSize: "40px"
      }}>
        ⚠️
      </div>
      
      <h1 style={{ color: "#f44336", marginBottom: "20px" }}>
        로그인 오류
      </h1>
      
      <p style={{ 
        fontSize: "16px", 
        color: "#666", 
        marginBottom: "30px",
        maxWidth: "400px",
        lineHeight: "1.5"
      }}>
        {decodeURIComponent(errorMessage)}
      </p>
      
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <button 
          onClick={handleRetryLogin}
          style={{
            padding: "12px 24px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500"
          }}
        >
          다시 로그인
        </button>
        
        <button 
          onClick={handleGoHome}
          style={{
            padding: "12px 24px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500"
          }}
        >
          홈으로 가기
        </button>
      </div>
    </div>
  );
}
