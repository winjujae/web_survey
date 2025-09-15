// src/app/boards/[slug]/page.tsx
import { getBoardBySlug, getPostsByBoard, treatmentTags } from "@/lib/mock";
import Hero from "@/app/ui/Hero";
import LeftMenu from "@/app/ui/LeftMenu";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatKSTDateTime } from "@/lib/time";

type Props = {
  params: { slug: string };
  searchParams: { tag?: string };
};

export default async function BoardPage({ params, searchParams }: Props) {
  const {slug} = await params;
  const board = getBoardBySlug(slug);
  if (!board) return notFound();

  const {tag} = await searchParams;
  const items = getPostsByBoard(board.id, 50, tag);
    const res = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}/api/posts?`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load posts");
  const items = await res.json();
  
  return (
    <>
      <Hero
        title={board.title}
        subtitle={tag ? `#${treatmentTags.find(t => t.key === tag)?.label ?? tag}` : undefined}
      />

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <LeftMenu />
        </div>
        <div>
          {/* 게시글 목록 렌더 */}
          <section className="feed">
            {items.map(p => (
              <article key={p.id} className="card card--compact">
                <div className="head-compact">
                  <span className="avatar mini">{p.author[0]}</span>
                  <a className="handle" href="#">{p.author}</a>
                  <span className="dot" />
                  <time dateTime={p.createdAt}>
                    {formatKSTDateTime(p.createdAt)}
                  </time>
                  <Link className="title-inline" href={`/posts/${p.id}`}>{p.title}</Link>
                </div>
                {p.excerpt && <p className="excerpt" style={{ marginTop: 6 }}>{p.excerpt}</p>}
              </article>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
