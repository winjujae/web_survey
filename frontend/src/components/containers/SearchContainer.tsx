// src/app/components/SearchContainer.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { searchPosts } from "@/lib/api";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useURLSync } from "@/lib/hooks/useURLSync";
import { usePostFiltersStore } from "@/stores/usePostFilters";
import Feed from "../ui/Feed";
import type { Post } from "@/types/post";

export default function SearchContainer() {
  const { query, setQuery } = usePostFiltersStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  // URL 동기화 활성화
  useURLSync();

  // 검색 실행
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setPosts([]);
        setTotal(0);
        return;
      }

      setLoading(true);
      try {
        const result = await searchPosts(debouncedQuery.trim());
        setPosts(result.posts);
        setTotal(result.total);
      } catch (error) {
        console.error("검색 실패:", error);
        setPosts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="게시글, 제목, 내용에서 검색..."
          className="input"
          style={{ width: "100%", maxWidth: 400 }}
        />
      </div>
      
      {query && (
        <div style={{ marginBottom: 16, color: "#666" }}>
          {loading ? (
            "검색 중..."
          ) : (
            `'${query}' 검색 결과: ${total}개`
          )}
        </div>
      )}

      {loading ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : posts.length > 0 ? (
        <Feed posts={posts} searchQuery={query} />
      ) : query ? (
        <div className="card">
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : null}
    </div>
  );
}
