//src/app/components/SearchBox.tsx
"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePostFiltersStore } from "@/stores/usePostFilters";

export default function SearchBox() {
  const { query, setQuery } = usePostFiltersStore();
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 검색 실행
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // "/" 눌러서 포커스
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault(); 
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form onSubmit={handleSearch} className="search" aria-label="검색">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <circle cx="11" cy="11" r="7" stroke="currentColor" fill="none" />
        <path d="M20 20l-3.2-3.2" stroke="currentColor" />
      </svg>
      <input
        ref={ref}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="게시글, 태그, 작성자 검색 (/ 단축키)"
      />
    </form>
  );
}
