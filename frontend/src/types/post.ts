// src/types/post.ts
import type { components } from "@/types/generated/openapi";

export type Comment = {
  id: string;
  userId: string;
  body: string;
  createdAt: string; // ISO
  ownerId?: string;
  status?: "active" | "deleted";
  parentId?: string;
  replies?: Comment[];
};

// 백엔드 응답 DTO 기반 타입
export type BackendPost = components["schemas"]["PostViewDto"];

// UI 전용 확장 타입 (클라이언트 상태/표현용 필드만 추가)
export type Post = BackendPost & {
  excerpt?: string;
  liked?: boolean;
  disliked?: boolean;
  dislikes?: number;
  comments?: Comment[];
};
