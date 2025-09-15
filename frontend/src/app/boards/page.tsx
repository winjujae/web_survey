// src/app/boards/page.tsx - 게시판 목록 페이지
import Hero from "@/app/ui/Hero";
import LeftMenu from "@/app/ui/LeftMenu";
import Breadcrumb from "@/app/components/Breadcrumb";
import { getBoards } from "@/lib/mock";
import Link from "next/link";

export default function BoardsPage() {
  const boards = getBoards();

  return (
    <>
      <Breadcrumb />
      <Hero 
        title="게시판" 
        subtitle="관심 있는 주제별로 게시글을 확인해보세요."
      />
      
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <LeftMenu />
        </div>
        
        <div>
          <div className="boards-grid">
            {boards.map(board => (
              <Link 
                key={board.id} 
                href={`/boards/${board.slug}`}
                className="board-card"
              >
                <div className="board-card-content">
                  <h3 className="board-title">{board.title}</h3>
                  <p className="board-description">
                    {getBoardDescription(board.id)}
                  </p>
                  <div className="board-stats">
                    <span>게시글 0개</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function getBoardDescription(boardId: string): string {
  const descriptions: Record<string, string> = {
    talk: "탈모에 대한 고민과 경험을 자유롭게 나누는 공간입니다.",
    treatment: "탈모 치료제, 약물, 제품에 대한 정보를 공유합니다.",
    reviews: "병원, 클리닉, 치료 경험에 대한 솔직한 후기를 남겨주세요.",
    clinics: "지역별 병원과 클리닉 정보를 확인하고 후기를 공유하세요."
  };
  return descriptions[boardId] || "게시판 설명";
}
