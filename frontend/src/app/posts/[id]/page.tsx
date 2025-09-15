//src/app/posts/[id]/page.tsx
import { notFound } from "next/navigation";
import PostDetailContainer from "./PostDetailContainer";
import { fetchPost } from "@/lib/api";

export default async function PostDetail({ params }: { params: { id: string }}) {
  const post = await fetchPost(params.id);
  if (!post) return notFound();

  return <PostDetailContainer post={post} />;
