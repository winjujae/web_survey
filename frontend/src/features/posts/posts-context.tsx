// src/features/posts/posts-context.tsx
"use client";
import { createContext, useContext, useMemo, useState } from "react";
import type { Post } from "../../types/post";
import { makePosts } from "../../lib/mock";

type Ctx = {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  toggleLike: (id: string) => void;
};

const PostsCtx = createContext<Ctx | null>(null);

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(() => makePosts());

  const toggleLike = (id: string) =>
    setPosts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, hot: p.liked ? p.hot - 1 : p.hot + 1, liked: !p.liked } : p
      )
    );

  const value = useMemo(() => ({ posts, setPosts, toggleLike }), [posts]);
  return <PostsCtx.Provider value={value}>{children}</PostsCtx.Provider>;
}

export function usePosts() {
  const v = useContext(PostsCtx);
  if (!v) throw new Error("usePosts must be used within PostsProvider");
  return v;
}
