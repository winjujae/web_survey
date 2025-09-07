// src/app/boards/[slug]/page.tsx
import { getBoardBySlug, getPostsByBoard, treatmentTags } from "@/lib/mock";
import Hero from "@/app/ui/Hero";
import LeftMenu from "@/app/ui/LeftMenu";
import { notFound } from "next/navigation";
import PostCard from "@/app/ui/PostCard";     // ✅ 추가

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

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <LeftMenu />
        </div>

        <div>
          {/* ✅ PostCard로 통일 */}
          <section className="feed">
            {items.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
