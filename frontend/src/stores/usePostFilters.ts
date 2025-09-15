import { create } from "zustand";

export type SortKey = "new" | "hot";

type State = {
  query: string;
  sort: SortKey;
  setQuery: (q: string) => void;
  setSort: (s: SortKey) => void;
};

export const usePostFiltersStore = create<State>((set) => ({
  query: "",
  sort: "new",
  setQuery: (q) => set({ query: q }),
  setSort: (s) => set({ sort: s }),
}));


