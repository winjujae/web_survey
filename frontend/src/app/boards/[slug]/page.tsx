// app/boards/[slug]/page.tsx
import { notFound } from "next/navigation";
import Hero from "@/app/ui/Hero";
import LeftMenu from "@/app/ui/LeftMenu";
import Feed from "@/app/ui/Feed";
import { fetchPostsByCategory, fetchPosts } from "@/lib/api";

type Props = { params: { slug: string }; searchParams: { tag?: string } };

const BOARD_LABEL: Record<string, string> = {
  talk: "소통하기",
  treatment: "치료/약 정보",
  reviews: "후기/리뷰",
  clinics: "지역 병원/클리닉",
};

export default async function BoardPage({ params, searchParams }: Props) {
  const { slug } = params;
  const { tag } = searchParams;

  const boardTitle = BOARD_LABEL[slug];
  if (!boardTitle) return notFound();

  // 카테고리별 게시글 조회 (카테고리 ID가 있다면)
  let posts;
  if (slug && BOARD_LABEL[slug]) {
    // 모든 게시글을 가져온 후 클라이언트에서 필터링 (임시)
    posts = await fetchPosts();
    // 실제로는 카테고리별 API가 필요: posts = await fetchPostsByCategory(slug);
  } else {
    posts = await fetchPosts();
  }

  // 태그 필터링
  let items = tag ? posts.filter(p => p.tags.some(t => t.includes(tag))) : posts;

  return (
    <>
      <Hero title={boardTitle} subtitle={tag ? `#${tag}` : undefined} />
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginTop: 12 }}>
        <div><LeftMenu /></div>
        <div>
          {items.length > 0 ? (
            <Feed posts={items} />
          ) : (
            <div className="card card--compact">
              <p>게시글이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
