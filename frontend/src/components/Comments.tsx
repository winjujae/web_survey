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
  initial = [],
}: {
  postId: string;
  initial?: CommentItem[];
}) {
  const [items, setItems] = useState<CommentItem[]>(initial);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [overflow, setOverflow] = useState<Record<string, boolean>>({});
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  // 개별 댓글 본문이 3줄을 넘는지 측정
  const measureOne = (id: string) => {
    const el = refs.current[id];
    if (!el) return;

    // 현재 line-height(px)
    const lh = parseFloat(getComputedStyle(el).lineHeight || "0") || 20;
    const threeLines = lh * 3;

    // 클램프 클래스가 있으면 잠시 제거해서 전체 높이를 측정
    const hadClamp = el.classList.contains(styles.bodyClamped);
    if (hadClamp) el.classList.remove(styles.bodyClamped);

    const contentH = el.scrollHeight; // 실제 콘텐츠 전체 높이

    // 확장 상태가 아니라면 다시 클램프 원복
    if (hadClamp && !expanded[id]) el.classList.add(styles.bodyClamped);

    const willOverflow = contentH > threeLines + 1; // 미세 오차 여유
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

  // 최초 로드 & 서버 최신 상태 동기화
  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/posts/${postId}`, { cache: "no-store" });
      if (!r.ok) return;
      const d = await r.json();
      if (Array.isArray(d.comments)) setItems(d.comments);
    })();
  }, [postId]);

  // 목록이 바뀌면 다음 프레임에 전체 측정 + 리사이즈 대응
  useEffect(() => {
    const raf = requestAnimationFrame(measureAll);
    const onResize = () => requestAnimationFrame(measureAll);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // expanded는 토글 버튼 노출 판정에 필요 없음(클램프 해제만 컨트롤)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  if (!items.length)
    return <p style={{ color: "var(--muted)" }}>아직 댓글이 없어요.</p>;

  return (
    <ul className={styles.list}>
      {items.map((c) => {
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
