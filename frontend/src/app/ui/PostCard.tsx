// src/app/ui/PostCard.tsx
"use client";

import Link from "next/link";
import type { Post } from "@/types/post";
import { usePosts } from "@/features/posts/posts-context";
import { useAuthGuard } from "@/features/auth/withAuthGuard";

/** 검색어를 <mark>로 하이라이트 */
function highlight(text: string, q: string) {
  if (!q) return text;
  // 정규식 특수문자 이스케이프
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "ig");
  const parts = text.split(re);
  return parts.map((chunk, i) =>
    re.test(chunk) ? <mark key={i}>{chunk}</mark> : <span key={i}>{chunk}</span>
  );
}

export default function PostCard({ post }: { post: Post }) {
  const { query, toggleLike } = usePosts();
  const guard = useAuthGuard();

  const liked = !!post.likes;
  const likes = post.likes ?? 0;

  return (
    <article className="card card--compact">
      {/* 한 줄 헤더 영역 */}
      <div className="head-compact">
        <span className="avatar mini">{post.author?.[0] ?? "U"}</span>
        <a className="handle" href="#">{post.author}</a>
        <span className="dot" />
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleString("ko-KR", { hour12: false })}
        </time>
      </div>

      {/* 요약(검색 하이라이트 적용) */}
      {post.title && (
        <p>
          <Link className="title-inline" href={`/posts/${post.id}`}>
          {highlight(post.title, query)}
        </Link>
        </p>
      )}

      {/* 메타/액션 */}
      <div className="meta" style={{ gap: 8 }}>
        <button
          className="action"
          aria-pressed={liked}
          onClick={guard(() => toggleLike(post.id))}
          title={liked ? "좋아요 취소" : "좋아요"}
        >
          ❤ {likes}
        </button>

        <span className="dot" />
        <span>조회 {post.views ?? 0}</span>

        {post.tags?.length ? (
          <>
            <span className="dot" />
            <div className="tags">
              {post.tags.map((t) => (
                <span key={t} className="post-chip">#{t}</span>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </article>
  );
}
