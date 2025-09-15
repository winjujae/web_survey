//src/app/ui/SortTabs.tsx
"use client";
import { usePostFiltersStore } from "@/stores/usePostFilters";
export default function SortTabs() {
  const sort = usePostFiltersStore(s => s.sort);
  const setSort = usePostFiltersStore(s => s.setSort);
  return (
    <div className="tabs" role="tablist" aria-label="정렬">
      <button role="tab" className="tab" aria-selected={sort==="new"} onClick={() => setSort("new")}>최신순</button>
      <button role="tab" className="tab" aria-selected={sort==="hot"} onClick={() => setSort("hot")}>인기</button>
    </div>
  );
}
