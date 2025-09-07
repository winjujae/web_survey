// src/app/components/RightDock.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useUIStore } from "@/stores/useUIStore";

export default function RightDock() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const open = useUIStore((s) => s.rightDockOpen);
  const toggle = useUIStore((s) => s.toggleDock);
  const close = useUIStore((s) => s.closeDock);

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // 닫힐 때 토글 버튼에 포커스 복귀(접근성)
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
        onClick={toggle}
        title={open ? "사이드 닫기" : "사이드 열기"}
      >
        {open ? "→" : "←"} 패널
      </button>

      {/* (모바일) 백드롭 */}
      {open && <div className="dock-backdrop" onClick={close} aria-hidden />}

      {/* 패널 */}
      <aside
        id="right-dock-panel"
        role="complementary"
        className={`dock-panel ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="dock-inner">
          <header className="dock-header">
            <strong>도움 패널</strong>
            <button className="dock-close" onClick={close} aria-label="사이드 닫기">✕</button>
          </header>

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
