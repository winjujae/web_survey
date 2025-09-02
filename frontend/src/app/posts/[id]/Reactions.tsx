//src/app/posts/[id]/Reactions.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useAuthGuard } from "@/features/auth/withAuthGuard";
import { usePosts } from "@/features/posts/posts-context";
import { apiReact } from "@/features/posts/posts-service";

export default function Reactions({ postId }: { postId: string }) {
  const { token } = useAuth();          // 토큰 필요 시 사용
  const { posts, toggleLike, vote } = usePosts();
  const guard = useAuthGuard();
  const [pending, setPending] = useState<null | "up" | "down">(null);

  const p = posts.find(x => x.id === postId);
  if (!p) return null;

  const like = guard(async () => {
    setPending("up");
    const prev = { liked: p.liked, likes: p.likes ?? 0 };
    toggleLike(p.id); // optimistic
    try { await apiReact(p.id, 1, token ?? undefined); }
    catch { /* 롤백 */ vote(p.id, -1); (p.liked = prev.liked); (p.likes = prev.likes); }
    finally { setPending(null); }
  });

  const dislike = guard(async () => {
    setPending("down");
    const prev = { dislikes: p.dislikes ?? 0 };
    vote(p.id, -1); // optimistic
    try { await apiReact(p.id, -1, token ?? undefined); }
    catch { vote(p.id, +1); (p.dislikes = prev.dislikes); }
    finally { setPending(null); }
  });

  return (
    <div className="actions">
      <button className="action" aria-pressed={!!p.liked} onClick={like} disabled={pending==="up"}>
        👍 좋아요 {p.likes ?? 0}
      </button>
      <button className="action" aria-pressed={!!p.disliked} onClick={dislike} disabled={pending==="down"}>
        👎 싫어요 {p.dislikes ?? 0}
      </button>
    </div>
  );
}
