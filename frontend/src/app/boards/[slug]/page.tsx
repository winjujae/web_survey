// src/app/boards/[slug]/page.tsx
import { getBoardBySlug, getPostsByBoard, treatmentTags } from "@/lib/mock";
import Hero from "@/app/ui/Hero";
import LeftMenu from "@/app/ui/LeftMenu";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: { slug: string };
  searchParams: { tag?: string };
};

export default function BoardPage({ params, searchParams }: Props) {
  const board = getBoardBySlug(params.slug);
  if (!board) return notFound();

  const tag = searchParams.tag;
  const items = getPostsByBoard(board.id, 50, tag);

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
                    {new Date(p.createdAt).toLocaleString("ko-KR", { hour12: false })}
                  </time>
                  <a className="title-inline" href={`/posts/${p.id}`}>{p.title}</a>
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
