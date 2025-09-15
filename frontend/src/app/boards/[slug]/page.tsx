// app/boards/[slug]/page.tsx
import { notFound } from "next/navigation";
import { formatKSTDateTime } from "@/lib/time";
import Link from "next/link";
import Hero from "@/app/ui/Hero";
import LeftMenu from "@/app/ui/LeftMenu";

type Props = { params: { slug: string }; searchParams: { tag?: string } };

const BOARD_LABEL: Record<string, string> = {
  talk: "소통하기",
  treatment: "치료/약 정보",
  reviews: "후기/리뷰",
  clinics: "지역 병원/클리닉",
};

// API 응답 데이터 구조에 맞게 수정된 함수
function normalizePosts(rows: any[]) {
  return rows.map((post) => ({
    id: String(post?.post_id ?? ""),
    author: post?.is_anonymous ? (post?.anonymous_nickname ?? "익명") : (post?.user?.nickname ?? "작성자"),
    createdAt: String(post?.created_at ?? new Date().toISOString()),
    title: String(post?.title ?? "(제목 없음)"),
    excerpt: String(post?.content?.substring(0, 100) ?? ""), // content의 일부를 요약으로 사용
    boardId: String(post?.category_id ?? ""),
    tags: Array.isArray(post?.tags) ? post.tags : [],
  }));
}

export default async function BoardPage({ params, searchParams }: Props) {
  const { slug } = params;
  const { tag } = searchParams;

  const boardTitle = BOARD_LABEL[slug];
  if (!boardTitle) return notFound();

  const base = process.env.API_URL!;
  // API 엔드포인트가 /api/posts 가 맞는지 다시 한번 확인해보세요.
  // 로그에는 GET /boards/clinics 로 기록되어 있습니다.
  const res = await fetch(`${base}/api/posts`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load posts: ${res.status}`);

  // API 응답에서 실제 데이터 배열을 가져오도록 수정
  const responseData = await res.json();
  let items = responseData?.data && Array.isArray(responseData.data) 
    ? normalizePosts(responseData.data) 
    : [];

  if (tag) items = items.filter(p => p.tags.includes(tag));

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
