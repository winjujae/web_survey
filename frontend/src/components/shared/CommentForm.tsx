// src/components/CommentForm.tsx
"use client";
import { useAuth } from "@/features/auth/auth-context";
import { createComment } from "@/lib/api";
import { useRef, useState } from "react";
import styles from "./CommentForm.module.css";

export default function CommentForm({
  postId,
  onSubmitted,
  parentId,
  placeholder,
  compact,
}: {
  postId: string;
  onSubmitted: (c: any) => void;
  parentId?: string;
  placeholder?: string;
  compact?: boolean;
}) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [pending, setPending] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!user) return setErr("로그인이 필요합니다.");
    if (!body.trim()) return setErr("내용을 입력하세요.");
    setErr("");
    setPending(true);
    try {
      const c = await createComment({ post_id: postId, content: body, parent_comment_id: parentId });
      setBody("");
      requestAnimationFrame(() => {
        if (taRef.current) taRef.current.scrollTop = taRef.current.scrollHeight;
      });
      onSubmitted(c);
    } catch {
      setErr("등록 실패");
    } finally {
      setPending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.inputWrap}>
        <textarea
          ref={taRef}
          className={styles.textarea}
          placeholder={placeholder || (parentId ? "답글을 입력하세요" : "댓글을 입력하세요")}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            requestAnimationFrame(() => {
              const el = taRef.current;
              if (el) el.scrollTop = el.scrollHeight;
            });
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submit();
          }}
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={pending}>
          {parentId ? "답글 등록" : "등록"}
        </button>
      </div>

      {err && <span className={styles.error}>{err}</span>}
    </form>
  );
}
