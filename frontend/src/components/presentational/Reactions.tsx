// src/components/presentational/Reactions.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useAuthGuard } from "@/features/auth/withAuthGuard";
import { usePostMutations } from "@/features/posts/hooks";
import type { Post } from "@/types/post";

interface ReactionsProps {
  post: Post;
}

export default function Reactions({ post }: ReactionsProps) {
  const { user } = useAuth();
  const guard = useAuthGuard();
  const { like, dislike } = usePostMutations();
  const [pending, setPending] = useState<null | "up" | "down">(null);

  const handleLike = guard(async () => {
    if (!user) return;
    
    setPending("up");
    try {
      await like.mutateAsync(post.id);
    } catch (error) {
      console.error("좋아요 실패:", error);
    } finally {
      setPending(null);
    }
  });

  const handleDislike = guard(async () => {
    if (!user) return;
    
    setPending("down");
    try {
      await dislike.mutateAsync(post.id);
    } catch (error) {
      console.error("싫어요 실패:", error);
    } finally {
      setPending(null);
    }
  });

  return (
    <div className="actions">
      <button 
        className="action" 
        aria-pressed={!!post.liked} 
        onClick={handleLike} 
        disabled={pending === "up" || like.isPending}
        title={post.liked ? "좋아요 취소" : "좋아요"}
      >
        👍 좋아요 {post.likes ?? 0}
      </button>
      <button 
        className="action" 
        aria-pressed={!!post.disliked} 
        onClick={handleDislike} 
        disabled={pending === "down" || dislike.isPending}
        title={post.disliked ? "싫어요 취소" : "싫어요"}
      >
        👎 싫어요 {post.dislikes ?? 0}
      </button>
    </div>
  );
}
