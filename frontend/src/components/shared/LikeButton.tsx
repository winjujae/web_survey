// src/components/LikeButton.tsx
"use client";
import { useAuth } from "@/features/auth/auth-context";
import { useState } from "react";

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
      const r = await fetch(`/api/posts/${postId}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id ?? "me" }),
      });
      const data = await r.json();
      setCount(data.count);
      onChange?.(data.count);
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
