// 모든 Context 묶음
import { AuthProvider } from "../features/auth/auth-context";
import { PostsProvider } from "../features/posts/posts-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PostsProvider>{children}</PostsProvider>
    </AuthProvider>
  );
}