// src/app/components/RightDock.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function RightDock() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 열릴 때 포커스 트랩의 시작점 확보 (접근성 보정은 간단 버전)
  useEffect(() => {
    if (!open) btnRef.current?.focus();
  }, [open]);

  return (
    <>
      {/* 플로팅 토글 버튼 */}
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls="right-dock-panel"
        className="dock-fab"
        onClick={() => setOpen(v => !v)}
        title={open ? "사이드 닫기" : "사이드 열기"}
      >
        {open ? "→" : "←"} 패널
      </button>

      {/* (옵션) 반투명 백드롭 - 모바일에서 외부 클릭으로 닫기 */}
      {open && (
        <div className="dock-backdrop" onClick={() => setOpen(false)} aria-hidden />
      )}

      {/* 슬라이드 패널 */}
      <aside
        id="right-dock-panel"
        role="complementary"
        className={`dock-panel ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="dock-inner">
          <header className="dock-header">
            <strong>도움 패널</strong>
            <button className="dock-close" onClick={() => setOpen(false)} aria-label="사이드 닫기">✕</button>
          </header>

          {/* ── 이 아래에 기존 aside 내용 이식 ── */}
          <section className="panel">
            <h3>인기 태그</h3>
            <div className="tag-chip">#병원</div>
            <div className="tag-chip">#후기</div>
            <div className="tag-chip">#서울</div>
          </section>

          <section className="panel">
            <h3>공지</h3>
            <div className="trend">
              <Link href="/posts/1"><span className="rank">1</span><span>필독! 게시판 이용 규칙</span></Link>
              <Link href="/posts/2"><span className="rank">2</span><span>매너 가이드</span></Link>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
