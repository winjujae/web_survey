// src/lib/mock.ts
import type { Board } from "@/types/board";
import type { Post } from "@/types/post";

export const boards: Board[] = [
  { id: "talk",           slug: "talk",      title: "소통하기" },
  { id: "treatment",      slug: "treatment", title: "치료/약 정보" },
  { id: "reviews",        slug: "reviews",   title: "관리후기/제품리뷰" },
  { id: "clinics",        slug: "clinics",   title: "지역 병원/클리닉" },
];

// “치료/약 정보”에서 제공할 태그 프리셋(왼쪽 메뉴용)
export const treatmentTags = [
  { key: "finasteride", label: "피나스테리드" },
  { key: "dutasteride", label: "두타스테리드" },
  { key: "minoxidil",   label: "미녹시딜" },
  { key: "supplement",  label: "영양제/기타" },
];

export const posts: Post[] = Array.from({ length: 24 }).map((_, i) => ({
  id: String(i + 1),
  // ✨ 이제 진짜 게시판 id만 사용 (상위만)
  boardId: i % 2 ? "treatment" : "reviews",
  title: `병원 후기알려준다.. 니들은 이런거 하지마라 ${i + 1}`,
  excerpt: "간단 요약이 이곳에 들어갑니다. 내용 일부…",
  author: i % 3 ? "자라매니저" : "디자인얍",
  createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
  // ✨ 하위 분류는 태그로만
  tags: i % 2
    ? ["피나스테리드", "부작용"]
    : ["모발이식", "후기"],
  likes: Math.floor(Math.random() * 50),
  dislikes: Math.floor(Math.random() * 10),
  views: 1000 + i * 37,
  body: "오늘 병원 다녀왔는데 ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ \n나는 탈모 걱정없댄다 수고해라 ㅋㅋ",
}));

export const getBoards = () => boards;
export const getBoardBySlug = (slug: string) =>
  boards.find(b => b.slug === slug || b.id === slug);

export const getPosts = (limit = 20) =>
  posts.slice(0, limit);

// 단일 게시판에서 tag(옵션)로 필터링
export const getPostsByBoard = (boardId: string, limit = 20, tag?: string) => {
  let list = posts.filter(p => p.boardId === boardId);
  if (tag) {
    const lower = tag.toLowerCase();
    list = list.filter(p => p.tags?.some(t => t.toLowerCase().includes(lower)));
  }
  return list.slice(0, limit);
};

export const getPost = (id: string) => posts.find(p => p.id === id);

// src/lib/mock.ts (기존 내용 하단에 추가)
import type { Comment } from "@/types/post";

let _autoId = 1000;

export function addPost(input: {
  title: string;
  body?: string;
  boardId?: string;
  tags?: string[];
  authorId?: string;
}) {
  const id = String(++_autoId);
  const now = new Date().toISOString();
  const post: Post = {
    id,
    boardId: input.boardId ?? "talk",
    title: input.title,
    excerpt: input.body?.slice(0, 80),
    author: input.authorId ?? "익명",
    createdAt: now,
    tags: input.tags ?? [],
    likes: 0,
    dislikes: 0,
    views: 0,
    body: input.body ?? "",
    comments: [],
  };
  posts.unshift(post);
  return post;
}

export function addComment(postId: string, userId: string, body: string) {
  const p = posts.find(p => p.id === postId);
  if (!p) return null;
  const c: Comment = {
    id: String(++_autoId),
    userId,
    body,
    createdAt: new Date().toISOString(),
  };
  (p.comments ??= []).push(c);
  return c;
}

export function toggleLike(postId: string, _userId: string) {
  // 데모: 사용자별 중복 체크 없이 +1
  const p = posts.find(p => p.id === postId);
  if (!p) return null;
  p.likes = Math.max(0, (p.likes ?? 0) + 1);
  return { liked: true, count: p.likes };
}

export function toggleDislike(postId: string, _userId: string) {
  // 데모: 사용자별 중복 체크 없이 +1
  const p = posts.find(p => p.id === postId);
  if (!p) return null;
  p.dislikes = Math.max(0, (p.dislikes ?? 0) + 1);
  return { disliked: true, count: p.dislikes };
}