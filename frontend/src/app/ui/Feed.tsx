//src/app/ui/Feed.tsx
import PostCard from "./PostCard";
import type { Post } from "@/types/post";

export default function Feed({ posts }: { posts: Post[] }) {
  if (!posts?.length) return <div className="skeleton" />;
  return (
    <section className="feed">
      {posts.map(p => <PostCard key={p.id} post={p} />)}
    </section>
  );
}
