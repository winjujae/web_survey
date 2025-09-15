// src/app/posts/[id]/page.tsx
import { notFound } from "next/navigation";
import PostDetailContainer from "@/components/containers/PostDetailContainer";
import { fetchPost } from "@/lib/api";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const post = await fetchPost(id);
  if (!post) return notFound();
  return <PostDetailContainer post={post} />;
}
