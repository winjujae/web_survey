// src/lib/hooks/useOptimistic.ts
"use client";
import { useOptimistic as useReactOptimistic } from "react";

/**
 * React 19의 useOptimistic 훅을 활용한 옵티미스틱 업데이트
 * 좋아요, 댓글 등 즉시 UI 반영이 필요한 액션에 사용
 */
export function useOptimistic<T>(
  state: T,
  updateFn: (currentState: T, optimisticValue: any) => T
) {
  return useReactOptimistic(state, updateFn);
}

/**
 * 게시글 좋아요 옵티미스틱 업데이트
 */
export function useOptimisticLike(
  initialLikes: number,
  initialLiked: boolean
) {
  return useOptimistic(
    { likes: initialLikes, liked: initialLiked },
    (state, optimisticUpdate: { action: 'like' | 'unlike' }) => {
      if (optimisticUpdate.action === 'like') {
        return { likes: state.likes + 1, liked: true };
      } else {
        return { likes: Math.max(0, state.likes - 1), liked: false };
      }
    }
  );
}
