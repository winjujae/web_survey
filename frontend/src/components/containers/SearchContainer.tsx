// src/app/components/SearchContainer.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { searchPosts } from "@/lib/api";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useURLSync } from "@/lib/hooks/useURLSync";
import { usePostFiltersStore } from "@/stores/usePostFilters";
import { usePostsQuery } from "@/features/posts/hooks";
import { calculateSearchScore } from "@/lib/utils";
import Feed from "../ui/Feed";
import type { Post } from "@/types/post";

export default function SearchContainer() {
  const { query, setQuery } = usePostFiltersStore();
  const [serverPosts, setServerPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  
  // 전체 게시글 데이터 (클라이언트 사이드 검색용)
  const { data: allPosts } = usePostsQuery();

  // URL 동기화 활성화
  useURLSync();

  // 서버 검색 실행 (긴 검색어에 대해서만)
  useEffect(() => {
    const performServerSearch = async () => {
      if (!debouncedQuery.trim() || debouncedQuery.trim().length < 3) {
        setServerPosts([]);
        setTotal(0);
        return;
      }

      setLoading(true);
      try {
        const result = await searchPosts(debouncedQuery.trim());
        setServerPosts(result.posts);
        setTotal(result.total);
      } catch (error) {
        console.error("서버 검색 실패:", error);
        setServerPosts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    performServerSearch();
  }, [debouncedQuery]);

  // 클라이언트 사이드 검색 (posts-context 로직 이전)
  const clientSearchResults = useMemo(() => {
    if (!query.trim() || !allPosts) return [];
    
    return allPosts
      .map(p => ({ p, s: calculateSearchScore(p, query) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map(x => x.p);
  }, [allPosts, query]);

  // 최종 검색 결과 결정
  const finalResults = useMemo(() => {
    if (!query.trim()) return [];
    
    // 짧은 검색어는 클라이언트 사이드 검색 사용
    if (query.trim().length < 3) {
      return clientSearchResults;
    }
    
    // 긴 검색어는 서버 검색 결과 사용
    return serverPosts;
  }, [query, clientSearchResults, serverPosts]);

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
            `'${query}' 검색 결과: ${finalResults.length}개${
              query.trim().length >= 3 ? ` (서버 검색)` : ` (클라이언트 검색)`
            }`
          )}
        </div>
      )}

      {loading ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : finalResults.length > 0 ? (
        <Feed posts={finalResults} searchQuery={query} />
      ) : query ? (
        <div className="card">
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="card">
          <p>검색어를 입력하세요.</p>
        </div>
      )}
    </div>
  );
}
