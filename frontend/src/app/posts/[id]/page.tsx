// src/app/posts/[id]/page.tsx
import { notFound } from "next/navigation";
import PostDetail from "@/components/shared/PostDetail";
import { fetchPost } from "@/lib/api";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await fetchPost(id);
  if (!post) return notFound();
  return <PostDetail post={post} />;
}
