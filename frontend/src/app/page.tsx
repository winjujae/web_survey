// src/app/page.tsx
import Hero from "./ui/Hero";
import LeftMenu from "./ui/LeftMenu";
import Feed from "./ui/Feed";
import SortTabs from "./ui/SortTabs";
import { getPosts } from "@/lib/mock";

export default function HomePage() {
  const recent = getPosts(12);
  return (
    <>
      <Hero 
         title="자라머니 · 탈모 커뮤니티"
        subtitle="탈모 치료 경험 공유, 약·제품 정보, 모발이식 후기까지 모아서 서로 돕는 공간이에요."
      />
      <div style={{display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px", marginTop: 12}}>
        <div>
          <LeftMenu />
        </div>
        <div>
          <div className="tabs">
            <button className="tab" aria-selected="true">전체 최신</button>
            <button className="tab" aria-selected="false">인기</button>
          </div>
          <Feed posts={recent} />
        </div>
      </div>
    </>
  );
}