// src/components/Comments.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Comments.module.css";
import { useAuth } from "@/features/auth/auth-context";
import { deleteComment, updateComment } from "@/lib/api";
import type { Comment as UiComment } from "@/types/post";
import CommentForm from "./CommentForm";

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
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});

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
    if (c.status === 'deleted') return;
    const text = (editText[c.id] ?? "").trim();
    if (!text) return;
    setPending((m) => ({ ...m, [c.id]: true }));
    try {
      const updated = await updateComment(c.id, { content: text });
      setItems((arr) => arr.map((x) => (x.id === c.id ? updated : x)));
      // 렌더 중 외부 setState 방지: 비동기 완료 후 안전 시점에 콜백 호출
      setTimeout(() => onUpdated?.(updated), 0);
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
      // 소프트 삭제: 목록에서 제거하지 않고 표시만 변경
      setItems((arr) => arr.map((x) => x.id === c.id ? { ...x, status: 'deleted', body: '' } as UiComment : x));
      setTimeout(() => onDeleted?.(c.id), 0);
    } catch (e) {
      console.error("댓글 삭제 실패:", e);
      alert("댓글 삭제에 실패했습니다.");
    } finally {
      setPending((m) => ({ ...m, [c.id]: false }));
    }
  };

  const addReplyTo = (parentId: string, reply: UiComment) => {
    let updated: UiComment | undefined;
    setItems((arr) => arr.map((x) => {
      if (x.id !== parentId) return x;
      const replies = Array.isArray(x.replies) ? x.replies.slice() : [];
      replies.push(reply);
      const next = { ...x, replies } as UiComment;
      updated = next;
      return next;
    }));
    setReplyOpen((m) => ({ ...m, [parentId]: false }));
    if (updated) onUpdated?.(updated);
  };

  if (!items.length)
    return <p style={{ color: "var(--muted)" }}>아직 댓글이 없어요.</p>;

  const renderOne = (c: UiComment, key: string | number, isReply?: boolean) => {
    const isOpen = !!expanded[c.id];
    const isOverflow = !!overflow[c.id];
    const isEditing = !!editing[c.id];
    const isPending = !!pending[c.id];
    const isDeleted = c.status === 'deleted';
    const displayBody = isDeleted ? '삭제된 댓글입니다.' : c.body;

    return (
      <li className={styles.item} key={key}>
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
              {displayBody}
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

          {!isDeleted && canManage(c) && (
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

          {/* 대댓글 작성 토글 (부모 댓글에만, 삭제되지 않은 경우) */}
          {!isReply && !isDeleted && (
            <div style={{ marginTop: 8 }}>
              {!replyOpen[c.id] ? (
                <button
                  className={styles.moreBtn}
                  onClick={() => setReplyOpen((m) => ({ ...m, [c.id]: true }))}
                >
                  답글 달기
                </button>
              ) : (
                <div style={{ marginTop: 8 }}>
                  <CommentForm
                    postId={postId}
                    parentId={c.id}
                    placeholder="답글을 입력하세요"
                    compact
                    onSubmitted={(reply) => addReplyTo(c.id, reply)}
                  />
                </div>
              )}
            </div>
          )}

          {/* 대댓글 렌더링 */}
          {Array.isArray(c.replies) && c.replies.length > 0 && (
            <ul className={styles.list} style={{ marginTop: 8, marginLeft: 16 }}>
              {c.replies.map((r, idx) => renderOne(r, `r-${c.id}-${idx}`, true))}
            </ul>
          )}
        </div>
      </li>
    );
  };

  return (
    <ul className={styles.list}>
      {items.map((c, index) => renderOne(c, c.id || `c-${index}`))}
    </ul>
  );
}
