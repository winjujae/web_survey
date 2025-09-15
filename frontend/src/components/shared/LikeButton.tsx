// src/components/LikeButton.tsx
"use client";
import { useAuth } from "@/features/auth/auth-context";
import { useState } from "react";
import { toggleLike } from "@/lib/api";

export default function LikeButton({
  postId, initialCount, onChange,
}: { postId: string; initialCount: number; onChange?: (n:number)=>void }) {
  const { user } = useAuth();
  const [count, setCount] = useState(initialCount ?? 0);
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (!user) return alert("로그인이 필요합니다.");
    setBusy(true);
    try {
      const { likes } = await toggleLike(postId);
      setCount(likes);
      onChange?.(likes);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className="btn" onClick={onClick} disabled={busy}>
      👍 좋아요 {count}
    </button>
  );
}
