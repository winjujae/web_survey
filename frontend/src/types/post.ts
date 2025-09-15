// src/types/post.ts
export type Comment = {
  id: string;
  userId: string;
  body: string;
  createdAt: string; // ISO
};

export type Post = {
  id: string;
  boardId: string;
  title: string;
  excerpt?: string;
  author: string;
  createdAt: string; // ISO
  tags?: string[];
  likes: number;     // 숫자(집계)
  liked?: boolean;   // 👈 추가
  views?: number;
  body: string;
  dislikes?: number; // 누락 가능성 보완
  disliked?: boolean;

  // ✨ 추가
  comments?: Comment[];
};
