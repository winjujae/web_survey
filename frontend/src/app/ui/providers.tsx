"use client";

import { AuthProvider } from "../../features/auth/auth-context";
import { PostsProvider } from "../../features/posts/posts-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PostsProvider>{children}</PostsProvider>
    </AuthProvider>
  );
}
