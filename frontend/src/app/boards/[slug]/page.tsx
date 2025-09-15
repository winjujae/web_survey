// app/boards/[slug]/page.tsx
import { notFound } from "next/navigation";
import Hero from "@/app/ui/Hero";
import LeftMenu from "@/app/ui/LeftMenu";
import PostCard from "@/app/ui/PostCard";
import Breadcrumb from "@/app/components/Breadcrumb";
import { fetchPosts /*, fetchPostsByCategory */ } from "@/lib/api";

type Props = { 
  params: Promise<{ slug: string }>; 
  searchParams: Promise<{ tag?: string }> 
};

const BOARD_LABEL: Record<string, string> = {
  talk: "소통하기",
  treatment: "치료/약 정보",
  reviews: "후기/리뷰",
  clinics: "지역 병원/클리닉",
};

export default async function BoardPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tag } = await searchParams;

  const boardTitle = BOARD_LABEL[slug];
  if (!boardTitle) return notFound();

  // TODO: 카테고리별 API가 준비되면 아래로 교체
  // const posts = await fetchPostsByCategory(slug);
  const posts = await fetchPosts();

  const items = tag
    ? posts.filter((p) => p.tags?.some((t: string) => t.includes(tag)))
    : posts;

  return (
    <>
      <Breadcrumb />
      <Hero title={boardTitle} subtitle={tag ? `#${tag}` : undefined} />

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <LeftMenu />
        </div>

        <div>
          {items?.length ? (
            <section className="feed">
              {items.map((p: any) => (
                <PostCard key={p.id} post={p} />
              ))}
            </section>
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
