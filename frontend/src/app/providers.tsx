// src/app/providers.tsx
"use client";
import { AuthProvider } from "../features/auth/auth-context";
import { LoginDialogProvider } from "@/features/auth/components/LoginDialogProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoginDialogProvider>{children}</LoginDialogProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
