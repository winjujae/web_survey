// src/app/components/HomeFeedContainer.tsx
"use client";

import { useMemo } from "react";
import Feed from "../ui/Feed";
import type { Post } from "@/types/post";
import { usePostsQuery } from "@/features/posts/hooks";
import { usePostFiltersStore } from "@/stores/usePostFilters";

type SortType = "new" | "hot";

interface HomeFeedContainerProps {
  initialPosts: Post[];
}

export default function HomeFeedContainer({ initialPosts }: HomeFeedContainerProps) {
  const { data } = usePostsQuery();
  const posts = (data && data.length ? data : initialPosts) as Post[];
  const sort = usePostFiltersStore(s => s.sort) as SortType;

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
      {/* 정렬 탭은 SortTabs 컴포넌트에서 제어 */}
      <Feed posts={sortedPosts} />
    </>
  );
}
