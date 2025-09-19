import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/types/post";
import { createPost, deletePost, fetchPost, fetchPosts, toggleLike, updatePost, toggleDislike, incrementView } from "@/lib/api";
import type { components } from "@/types/generated/openapi";
type CreatePostDto = components["schemas"]["CreatePostDto"];
type UpdatePostDto = components["schemas"]["UpdatePostDto"];

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
    mutationFn: (p: { id: string; data: UpdatePostDto }) =>
      updatePost(p.id, { title: p.data.title, content: p.data.content, tags: p.data.tags }),
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

  const dislike = useMutation({
    mutationFn: (id: string) => toggleDislike(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const view = useMutation({
    mutationFn: (id: string) => incrementView(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return useMemo(() => ({ create, update, remove, like, dislike, view }), [create, update, remove, like, dislike, view]);
}

// SortKey 타입은 @/stores/usePostFilters에서 import하여 사용
// 이 훅은 더 이상 사용되지 않음 (Zustand로 대체됨)


