// src/components/Comments.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Comments.module.css";

type CommentItem = {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
};

export default function Comments({
  postId,
  comments,
}: {
  postId: string;
  comments: CommentItem[];
}) {
  // 댓글 펼침/말줄임 상태만 로컬에서 관리
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [overflow, setOverflow] = useState<Record<string, boolean>>({});

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
    for (const c of comments) measureOne(c.id);
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
    // expanded는 클램프 토글에만 영향 (측정 트리거는 comments 변화로 충분)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  if (!comments.length)
    return <p style={{ color: "var(--muted)" }}>아직 댓글이 없어요.</p>;

  return (
    <ul className={styles.list}>
      {comments.map((c) => {
        const isOpen = !!expanded[c.id];
        const isOverflow = !!overflow[c.id];

        return (
          <li className={styles.item} key={c.id}>
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

              <div
                ref={setBodyRef(c.id)}
                className={`${styles.body} ${
                  !isOpen && isOverflow ? styles.bodyClamped : ""
                }`}
              >
                {c.body}
              </div>

              {isOverflow && (
                <button
                  className={styles.moreBtn}
                  onClick={() =>
                    setExpanded((m) => ({ ...m, [c.id]: !isOpen }))
                  }
                >
                  {isOpen ? ">> 간략히 보기" : ">> 자세히 보기"}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
