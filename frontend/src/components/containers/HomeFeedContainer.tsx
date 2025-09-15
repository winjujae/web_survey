// src/app/components/HomeFeedContainer.tsx
"use client";

import { useMemo, useState } from "react";
import Feed from "../ui/Feed";
import type { Post } from "@/types/post";
import { usePostsQuery } from "@/features/posts/hooks";

type SortType = "new" | "hot";

interface HomeFeedContainerProps {
  initialPosts: Post[];
}

export default function HomeFeedContainer({ initialPosts }: HomeFeedContainerProps) {
  const { data } = usePostsQuery();
  const posts = (data && data.length ? data : initialPosts) as Post[];
  const [sort, setSort] = useState<SortType>("new");

  // 인기 점수 계산 (시간 감쇠 포함)
  const hotScore = (p: Post) => {
    const up = p.likes ?? 0;
    const down = p.dislikes ?? 0;
    const score = Math.max(up - down, 0);
    const order = Math.log10(Math.max(score, 1));
    const epoch = 1_700_000_000; // 고정 기준(초)
    const t = (Date.parse(p.createdAt) / 1000) - epoch;
    // 5일 하프라이프 느낌으로 시간 가중
    return order + t / (60 * 60 * 24 * 5);
  };

  // 정렬된 게시글 목록
  const sortedPosts = useMemo(() => [...posts].sort((a, b) => {
    if (sort === "new") {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    } else {
      return hotScore(b) - hotScore(a);
    }
  }), [posts, sort]);

  return (
    <>
      <div className="tabs">
        <button 
          className="tab" 
          aria-selected={sort === "new"}
          onClick={() => setSort("new")}
        >
          전체 최신
        </button>
        <button 
          className="tab" 
          aria-selected={sort === "hot"}
          onClick={() => setSort("hot")}
        >
          인기
        </button>
      </div>
      <Feed posts={sortedPosts} />
    </>
  );
}
