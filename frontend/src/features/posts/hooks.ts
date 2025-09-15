import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/types/post";
import { createPost, deletePost, fetchPost, fetchPosts, toggleLike, updatePost } from "@/lib/api";
import type { components } from "@/types/generated/openapi";
type CreatePostDto = components["schemas"]["CreatePostDto"];

export function usePostsQuery() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
}

export function usePostQuery(id: string, initialData?: Post | null) {
  return useQuery({
    queryKey: ["posts", id],
    queryFn: () => fetchPost(id),
    enabled: !!id,
    initialData: initialData ?? undefined,
    staleTime: 10_000,
  });
}

export function usePostMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (input: CreatePostDto) => createPost(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const update = useMutation({
    mutationFn: (p: { id: string; data: Partial<Pick<Post, "title" | "body" | "tags">> }) =>
      updatePost(p.id, { title: p.data.title, content: p.data.body, tags: p.data.tags } as any),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["posts", variables.id] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const like = useMutation({
    mutationFn: (id: string) => toggleLike(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return useMemo(() => ({ create, update, remove, like }), [create, update, remove, like]);
}

export type SortKey = "new" | "hot";
export function usePostFilters() {
  // 간단한 클라이언트 상태 (필요 시 Zustand로 이관)
  const [state, setState] = useState<{ query: string; sort: SortKey }>({ query: "", sort: "new" });
  const setQuery = (query: string) => setState((s) => ({ ...s, query }));
  const setSort = (sort: SortKey) => setState((s) => ({ ...s, sort }));
  return { ...state, setQuery, setSort };
}


