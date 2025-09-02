// src/types/post.ts
export type Post = {
  id: string;
  boardId?: string;
  title: string;
  excerpt?: string;
  author: string;
  createdAt: string;         // ISO 문자열
  tags?: string[];
  views?: number;
  body?: string;

  // 리액션 관련 (추가)
  likes?: number;
  liked?: boolean;           // 내가 좋아요 눌렀는지
  dislikes?: number;
  disliked?: boolean;        // 내가 싫어요 눌렀는지
};
