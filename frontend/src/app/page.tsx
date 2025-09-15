// src/app/page.tsx
import Hero from "@/components/ui/Hero";
import LeftMenu from "@/components/ui/LeftMenu";
import HomeFeedContainer from "@/components/containers/HomeFeedContainer";
import { fetchPosts } from "@/lib/api";

export default async function HomePage() {
  const posts = await fetchPosts();
  
  return (
    <>
      <Hero 
         title="전체 게시글"
        subtitle="모든 게시판의 최신 게시글을 한눈에 확인하세요."
      />
      <div style={{display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px", marginTop: 12}}>
        <div>
          <LeftMenu />
        </div>
        <div>
          <HomeFeedContainer initialPosts={posts} />
        </div>
      </div>
    </>
  );
}