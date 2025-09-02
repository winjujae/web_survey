"use client";
import { useEffect, useRef, useState } from "react";
import { usePosts } from "@/features/posts/posts-context";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function SearchBox() {
  const { query, setQuery } = usePosts();
  const [local, setLocal] = useState(query);
  const debounced = useDebounce(local, 180);
  const ref = useRef<HTMLInputElement>(null);

  // 디바운스 된 값만 컨텍스트에 반영
  useEffect(() => { setQuery(debounced); }, [debounced, setQuery]);

  // "/" 눌러서 포커스
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault(); ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <label className="search" aria-label="검색">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <circle cx="11" cy="11" r="7" stroke="currentColor" fill="none" />
        <path d="M20 20l-3.2-3.2" stroke="currentColor" />
      </svg>
      <input
        ref={ref}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="게시글, 태그, 작성자 검색 (/ 단축키)"
      />
    </label>
  );
}
