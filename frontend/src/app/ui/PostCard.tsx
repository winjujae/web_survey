"use client";

import Link from "next/link";
import { useState } from "react";
import type { Post } from "@/types/post";
import { useAuthGuard } from "@/features/auth/withAuthGuard";
import { formatKSTDateTime } from "@/lib/time";
import { toggleLike as apiToggleLike } from "@/lib/api";

/** 검색어를 <mark>로 하이라이트 */
function highlight(text: string, q: string) {
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "ig");
  const parts = text.split(re);
  return parts.map((chunk, i) =>
    re.test(chunk) ? <mark key={i}>{chunk}</mark> : <span key={i}>{chunk}</span>
  );
}

interface PostCardProps {
  post: Post;
  searchQuery?: string;
}

export default function PostCard({ post, searchQuery = "" }: PostCardProps) {
  const [liked, setLiked] = useState(!!post.liked);
  const [likes, setLikes] = useState(post.likes ?? 0);
  const guard = useAuthGuard();

  const handleToggleLike = async () => {
    try {
      const result = await apiToggleLike(post.id);
      setLiked(result.liked);
      setLikes(result.likes);
    } catch {
      // 옵티미스틱 업데이트 (실패 시 토글)
      setLiked(!liked);
      setLikes(likes + (liked ? -1 : 1));
    }
  };

  return (
    <article className="card card--compact">
      {/* 한 줄 헤더 영역 */}
      <div className="head-compact">
        <span className="avatar mini">{post.author?.[0] ?? "U"}</span>
        <a className="handle" href="#">{post.author}</a>
        <span className="dot" />
        <time dateTime={post.createdAt}>
          {formatKSTDateTime(post.createdAt)}
        </time>

        {/* 제목: 링크 + 검색 하이라이트 */}
        <Link className="title-inline" href={`/posts/${post.id}`}>
          {highlight(post.title ?? "", searchQuery)}
        </Link>
      </div>

      {/* 요약(검색 하이라이트 적용) */}
      {post.excerpt && (
        <p className="excerpt" style={{ marginTop: 6 }}>
          {highlight(post.excerpt, searchQuery)}
        </p>
      )}

      {/* 메타/액션 */}
      <div className="meta" style={{ gap: 8 }}>
        <button
          className="action"
          aria-pressed={liked}
          onClick={guard(handleToggleLike)}
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
