// src/app/page.tsx
import Hero from "./ui/Hero";
import LeftMenu from "./ui/LeftMenu";
import HomeFeedContainer from "./components/HomeFeedContainer";
import { fetchPosts } from "@/lib/api";

export default async function HomePage() {
  const posts = await fetchPosts();
  
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
          <HomeFeedContainer initialPosts={posts} />
        </div>
      </div>
    </>
  );
}