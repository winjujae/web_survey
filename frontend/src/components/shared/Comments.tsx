// src/components/Comments.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Comments.module.css";
import { useAuth } from "@/features/auth/auth-context";
import { deleteComment, updateComment } from "@/lib/api";
import type { Comment as UiComment } from "@/types/post";

type Props = {
  postId: string;
  comments: UiComment[];
  onUpdated?: (updated: UiComment) => void;
  onDeleted?: (id: string) => void;
};

export default function Comments({ postId, comments, onUpdated, onDeleted }: Props) {
  const { user } = useAuth();

  // 로컬 목록 상태 (부모 업데이트 없이도 UI 반영)
  const [items, setItems] = useState<UiComment[]>(comments);
  useEffect(() => {
    setItems(comments);
  }, [comments]);

  // 댓글 펼침/말줄임 상태
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [overflow, setOverflow] = useState<Record<string, boolean>>({});

  // 수정 상태
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [editText, setEditText] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});

  // 각 댓글 본문 DOM 레퍼런스
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  // 한 개 댓글의 줄수/오버플로우 측정
  const measureOne = (id: string) => {
    const el = refs.current[id];
    if (!el) return;

    const lh = parseFloat(getComputedStyle(el).lineHeight || "0") || 20;
    const threeLines = lh * 3;

    const hadClamp = el.classList.contains(styles.bodyClamped);
    if (hadClamp) el.classList.remove(styles.bodyClamped);

    const contentH = el.scrollHeight;

    if (hadClamp && !expanded[id]) el.classList.add(styles.bodyClamped);

    const willOverflow = contentH > threeLines + 1;
    setOverflow((prev) =>
      prev[id] === willOverflow ? prev : { ...prev, [id]: willOverflow }
    );
  };

  const measureAll = () => {
    for (const c of items) measureOne(c.id);
  };

  // ref 콜백: 연결 즉시 한 번 측정
  const setBodyRef =
    (id: string) =>
    (el: HTMLDivElement | null): void => {
      refs.current[id] = el;
      if (el) requestAnimationFrame(() => measureOne(id));
    };

  // ✅ 부모가 넘겨준 comments가 바뀔 때마다 전체 다시 측정
  useEffect(() => {
    const raf = requestAnimationFrame(measureAll);
    const onResize = () => requestAnimationFrame(measureAll);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const canManage = (c: UiComment): boolean => {
    if (!user) return false;
    return c.ownerId === user.id || user.role === "admin";
  };

  const beginEdit = (c: UiComment) => {
    setEditing((m) => ({ ...m, [c.id]: true }));
    setEditText((m) => ({ ...m, [c.id]: c.body }));
  };

  const cancelEdit = (id: string) => {
    setEditing((m) => ({ ...m, [id]: false }));
  };

  const saveEdit = async (c: UiComment) => {
    const text = (editText[c.id] ?? "").trim();
    if (!text) return;
    setPending((m) => ({ ...m, [c.id]: true }));
    try {
      const updated = await updateComment(c.id, { content: text });
      setItems((arr) => arr.map((x) => (x.id === c.id ? updated : x)));
      onUpdated?.(updated);
      setEditing((m) => ({ ...m, [c.id]: false }));
    } catch (e) {
      console.error("댓글 수정 실패:", e);
      alert("댓글 수정에 실패했습니다.");
    } finally {
      setPending((m) => ({ ...m, [c.id]: false }));
    }
  };

  const removeOne = async (c: UiComment) => {
    if (!confirm("이 댓글을 삭제하시겠습니까?")) return;
    setPending((m) => ({ ...m, [c.id]: true }));
    try {
      await deleteComment(c.id);
      setItems((arr) => arr.filter((x) => x.id !== c.id));
      onDeleted?.(c.id);
    } catch (e) {
      console.error("댓글 삭제 실패:", e);
      alert("댓글 삭제에 실패했습니다.");
    } finally {
      setPending((m) => ({ ...m, [c.id]: false }));
    }
  };

  if (!items.length)
    return <p style={{ color: "var(--muted)" }}>아직 댓글이 없어요.</p>;

  return (
    <ul className={styles.list}>
      {items.map((c, index) => {
        const isOpen = !!expanded[c.id];
        const isOverflow = !!overflow[c.id];
        const isEditing = !!editing[c.id];
        const isPending = !!pending[c.id];

        return (
          <li className={styles.item} key={c.id || `c-${index}`}>
            <div className={styles.bubble}>
              <div className={styles.meta}>
                <span className={styles.name}>{c.userId}</span>
                <span>·</span>
                <time dateTime={c.createdAt}>
                  {new Date(c.createdAt).toLocaleString("ko-KR", {
                    hour12: false,
                  })}
                </time>
              </div>

              {!isEditing ? (
                <div
                  ref={setBodyRef(c.id)}
                  className={`${styles.body} ${
                    !isOpen && isOverflow ? styles.bodyClamped : ""
                  }`}
                >
                  {c.body}
                </div>
              ) : (
                <div className={styles.editWrap}>
                  <textarea
                    className={styles.body}
                    value={editText[c.id] ?? c.body}
                    onChange={(e) =>
                      setEditText((m) => ({ ...m, [c.id]: e.target.value }))
                    }
                    style={{ minHeight: 60 }}
                  />
                </div>
              )}

              {isOverflow && !isEditing && (
                <button
                  className={styles.moreBtn}
                  onClick={() =>
                    setExpanded((m) => ({ ...m, [c.id]: !isOpen }))
                  }
                >
                  {isOpen ? ">> 간략히 보기" : ">> 자세히 보기"}
                </button>
              )}

              {canManage(c) && (
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  {!isEditing ? (
                    <>
                      <button
                        className={styles.moreBtn}
                        onClick={() => beginEdit(c)}
                      >
                        수정
                      </button>
                      <button
                        className={styles.moreBtn}
                        onClick={() => removeOne(c)}
                        disabled={isPending}
                        style={{ color: "#d32f2f" }}
                      >
                        삭제
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className={styles.moreBtn}
                        onClick={() => saveEdit(c)}
                        disabled={isPending}
                      >
                        저장
                      </button>
                      <button
                        className={styles.moreBtn}
                        onClick={() => cancelEdit(c.id)}
                        disabled={isPending}
                      >
                        취소
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
