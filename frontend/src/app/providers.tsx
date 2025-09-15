// src/app/providers.tsx
"use client";
import { AuthProvider } from "../features/auth/auth-context";
import { LoginDialogProvider } from "@/features/auth/components/LoginDialogProvider";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { useState } from "react";

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
        <LoginDialogProvider>{children}</LoginDialogProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
