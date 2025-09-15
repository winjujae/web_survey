// app/boards/[slug]/page.tsx
import { notFound } from "next/navigation";
import { formatKSTDateTime } from "@/lib/time";
import Link from "next/link";
import Hero from "@/app/ui/Hero";
import LeftMenu from "@/app/ui/LeftMenu";
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
          <section className="feed">
            {items.length > 0 ? (
              items.map((p) => (
                <article key={p.id} className="card card--compact">
                  <div className="head-compact">
                    <span className="avatar mini">{p.author.substring(0, 1)}</span>
                    <a className="handle" href="#">{p.author}</a>
                    <span className="dot" />
                    <time dateTime={p.createdAt}>{formatKSTDateTime(p.createdAt)}</time>
                    <Link className="title-inline" href={`/posts/${p.id}`}>{p.title}</Link>
                  </div>
                  {p.excerpt && <p className="excerpt" style={{ marginTop: 6 }}>{p.excerpt}</p>}
                </article>
              ))
            ) : (
              // 데이터가 없을 때 표시할 UI
              <div className="card card--compact">
                <p>게시글이 없습니다.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
