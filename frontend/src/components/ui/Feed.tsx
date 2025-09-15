//src/app/ui/Feed.tsx
import PostCard from "./PostCard";
import type { Post } from "@/types/post";

interface FeedProps {
  posts: Post[];
  searchQuery?: string;
}

export default function Feed({ posts, searchQuery = "" }: FeedProps) {
  if (!posts?.length) return <div className="skeleton" />;
  return (
    <section className="feed">
      {posts.map(p => <PostCard key={p.id} post={p} searchQuery={searchQuery} />)}
    </section>
  );
}
