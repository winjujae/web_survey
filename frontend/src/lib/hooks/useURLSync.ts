// src/lib/hooks/useURLSync.ts
"use client";

import { useEffect } from "react";
import { usePostFiltersStore, type SortKey } from "@/stores/usePostFilters";

/**
 * URL 쿼리 파라미터와 Zustand 상태를 양방향 동기화하는 훅
 * posts-context의 URL 동기화 로직을 공식 흐름으로 이전
 */
export function useURLSync() {
  const { query, sort, setQuery, setSort } = usePostFiltersStore();

  // URL → 상태 (최초 마운트 시)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("q");
    const s = sp.get("sort") as SortKey | null;
    
    if (q) setQuery(q);
    if (s === "hot" || s === "new") setSort(s);
  }, []); // 빈 의존성 배열로 최초 마운트 시에만 실행

  // 상태 → URL (replaceState로 히스토리 오염 최소화)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const sp = new URLSearchParams(window.location.search);
    
    // 쿼리 파라미터 업데이트
    if (query) {
      sp.set("q", query);
    } else {
      sp.delete("q");
    }
    
    // 정렬 파라미터 업데이트
    if (sort && sort !== "new") {
      sp.set("sort", sort);
    } else {
      sp.delete("sort");
    }
    
    // URL 업데이트
    const qs = sp.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [query, sort]);
}

/**
 * URL에서 특정 파라미터를 읽어오는 유틸리티 훅
 */
export function useURLParam(key: string): string | null {
  if (typeof window === "undefined") return null;
  
  const sp = new URLSearchParams(window.location.search);
  return sp.get(key);
}

/**
 * URL 파라미터를 업데이트하는 유틸리티 함수
 */
export function updateURLParam(key: string, value: string | null): void {
  if (typeof window === "undefined") return;
  
  const sp = new URLSearchParams(window.location.search);
  
  if (value) {
    sp.set(key, value);
  } else {
    sp.delete(key);
  }
  
  const qs = sp.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}
