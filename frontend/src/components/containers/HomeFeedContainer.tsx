// src/app/components/HomeFeedContainer.tsx
"use client";

import { useMemo } from "react";
import Feed from "../ui/Feed";
import type { Post } from "@/types/post";
import { usePostsQuery } from "@/features/posts/hooks";
import { usePostFiltersStore } from "@/stores/usePostFilters";
import { useURLSync } from "@/lib/hooks/useURLSync";
import { calculateHotScore, calculateSearchScore } from "@/lib/utils";

type SortType = "new" | "hot";

interface HomeFeedContainerProps {
  initialPosts: Post[];
}

export default function HomeFeedContainer({ initialPosts }: HomeFeedContainerProps) {
  const { data } = usePostsQuery();
  const posts = (data && data.length ? data : initialPosts) as Post[];
  const { sort, query } = usePostFiltersStore();
  
  // URL 동기화 활성화
  useURLSync();

  // 검색 필터링된 게시글 목록
  const filteredPosts = useMemo(() => {
    if (!query.trim()) return posts;
    
    return posts
      .map(p => ({ p, s: calculateSearchScore(p, query) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map(x => x.p);
  }, [posts, query]);

  // 정렬된 게시글 목록
  const sortedPosts = useMemo(() => [...filteredPosts].sort((a, b) => {
    if (sort === "new") {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    } else {
      return calculateHotScore(b) - calculateHotScore(a);
    }
  }), [filteredPosts, sort]);

  return (
    <>
      {/* 정렬 탭은 SortTabs 컴포넌트에서 제어 */}
      <Feed posts={sortedPosts} searchQuery={query} />
    </>
  );
}
