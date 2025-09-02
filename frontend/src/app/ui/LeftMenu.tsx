// src/app/ui/LeftMenu.tsx
"use client";

import Link from "next/link";
import { getBoards, treatmentTags } from "@/lib/mock";

export default function LeftMenu() {
  const boards = getBoards();

  return (
    <aside className="panel">
      <h3>게시판</h3>
      <div className="nav-list">
        {boards.map(b => (
          <div key={b.id}>
            {/* 상위 게시판 링크 */}
            <Link className="nav-item" href={`/boards/${b.slug}`}>
              {b.title}
            </Link>

            {/* 치료/약 정보에만 태그 필터 노출 */}
            {b.id === "treatment" && (
              <div style={{ paddingLeft: 12, display: "flex", flexDirection: "column" }}>
                {treatmentTags.map(t => (
                  <Link
                    key={t.key}
                    className="nav-item"
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
