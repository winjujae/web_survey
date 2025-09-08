// src/app/posts/[id]/page.tsx
import { getPost } from "@/lib/mock";
import { notFound } from "next/navigation";
import PostDetail from "@/components/PostDetail"; // 실제 상세 렌더링 담당 컴포넌트

export default function Page({ params }: { params: { id: string } }) {
  const post = getPost(params.id);
  if (!post) notFound();

  // 데이터만 가져오고 렌더링은 PostDetail에 위임
  return <PostDetail post={post} />;
}
