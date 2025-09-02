// src/app/providers.tsx
"use client";
import { AuthProvider } from "../features/auth/auth-context";
import { PostsProvider } from "../features/posts/posts-context";
import { LoginDialogProvider } from "@/features/auth/components/LoginDialogProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PostsProvider>
        <LoginDialogProvider>{children}</LoginDialogProvider>
      </PostsProvider>
    </AuthProvider>
  );
}
