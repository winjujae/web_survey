// src/app/ui/LeftMenu.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getBoards, treatmentTags } from "@/lib/mock";

export default function LeftMenu() {
  const boards = getBoards();
  const pathname = usePathname();

  return (
    <aside className="panel">
      <h3>게시판</h3>
      <div className="nav-list">
        {/* 전체 게시글 링크 */}
        <Link 
          className={`nav-item ${pathname === "/" ? "active" : ""}`} 
          href="/"
        >
          🏠 전체 게시글
        </Link>

        <div className="nav-divider"></div>

        {boards.map(b => (
          <div key={b.id}>
            {/* 상위 게시판 링크 */}
            <Link 
              className={`nav-item ${pathname === `/boards/${b.slug}` ? "active" : ""}`} 
              href={`/boards/${b.slug}`}
            >
              {getBoardIcon(b.id)} {b.title}
            </Link>

            {/* 치료/약 정보에만 태그 필터 노출 */}
            {b.id === "treatment" && (
              <div style={{ paddingLeft: 12, display: "flex", flexDirection: "column" }}>
                {treatmentTags.map(t => (
                  <Link
                    key={t.key}
                    className={`nav-item nav-sub-item ${pathname === `/boards/${b.slug}` && new URLSearchParams(window.location.search).get('tag') === t.key ? "active" : ""}`}
                    href={`/boards/${b.slug}?tag=${t.key}`}
                  >
                    #{t.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

function getBoardIcon(boardId: string): string {
  const icons: Record<string, string> = {
    talk: "💬",
    treatment: "💊",
    reviews: "⭐",
    clinics: "🏥"
  };
  return icons[boardId] || "📝";
}
