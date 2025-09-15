// src/app/providers.tsx
"use client";
import { AuthProvider } from "../features/auth/auth-context";
import { LoginDialogProvider } from "@/features/auth/components/LoginDialogProvider";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        console.error("Query error:", error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* 클라이언트 최초 진입 시 CSRF 토큰 쿠키 프리패치 */}
        <PrefetchCsrf />
        <LoginDialogProvider>{children}</LoginDialogProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function PrefetchCsrf() {
  useEffect(() => {
    apiRequest('/api/auth/csrf').catch(() => {});
  }, []);
  return null;
}
