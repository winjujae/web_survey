// src/features/posts/posts-context.tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Post } from "@/types/post";

/** 정렬 키 */
export type SortKey = "new" | "hot";

/** 새 글 입력 타입 (폼에서 사용) */
export type NewPostInput = {
  boardId: string;
  title: string;
  body: string;
  tags?: string[];
  author: string;          // 현재 로그인 사용자 이름/핸들
};

type Ctx = {
  /** 원본 전체 목록 */
  posts: Post[];
  /** 검색/정렬 적용 결과 */
  items: Post[];
  /** 검색어 */
  query: string;
  /** 정렬 키 */
  sort: SortKey;

  /** 검색어 변경 */
  setQuery: (q: string) => void;
  /** 정렬 변경 */
  setSort: (s: SortKey) => void;

  /** 좋아요 토글(옵티미스틱) */
  toggleLike: (id: string) => void;
  /** 투표(1=업, -1=다운, 옵티미스틱) */
  vote: (id: string, dir: 1 | -1) => void;

  /** 새 글 추가(API 호출) → 새 글 id 반환 */
  addPost: (input: NewPostInput) => Promise<string>;

  /** (선택) 조회수 증가 */
  incView: (id: string) => void;
};

const PostsCtx = createContext<Ctx | null>(null);

// API 호출 함수
async function fetchPosts(): Promise<Post[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300';
    const response = await fetch(`${apiUrl}/api/posts`, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    if (!responseData.success || !Array.isArray(responseData.data)) {
      console.warn('API 응답 형식이 올바르지 않습니다:', responseData);
      return [];
    }
    
    // 백엔드 데이터를 프론트엔드 Post 타입으로 변환
    return responseData.data.map((post: any) => ({
      id: String(post?.post_id ?? ""),
      boardId: String(post?.category_id ?? ""),
      title: String(post?.title ?? "(제목 없음)"),
      excerpt: String(post?.content?.substring(0, 100) ?? ""),
      body: String(post?.content ?? ""),
      author: post?.is_anonymous ? (post?.anonymous_nickname ?? "익명") : (post?.user?.nickname ?? "작성자"),
      createdAt: String(post?.created_at ?? new Date().toISOString()),
      tags: Array.isArray(post?.tags) ? post.tags.map((tag: any) => tag.name || tag) : [],
      likes: Number(post?.likes || 0),
      views: Number(post?.view_count || 0),
      dislikes: 0, // 백엔드에 dislike 기능이 없으므로 기본값
      liked: false, // 로그인 기능 연결 후 실제 상태로 변경 필요
      disliked: false,
    }));
  } catch (error) {
    console.error('게시글 데이터 로딩 실패:', error);
    return [];
  }
}

export function PostsProvider({ children }: { children: React.ReactNode }) {
  // 초기 데이터를 빈 배열로 시작하고 useEffect에서 로드
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("new");

  /* ───────────────── 초기 데이터 로딩 ───────────────── */
  
  // 컴포넌트 마운트 시 게시글 데이터 로드
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const postsData = await fetchPosts();
      setPosts(postsData);
      setLoading(false);
    };
    
    loadPosts();
  }, []);

  /* ───────────────── URL <-> 상태 동기화 ───────────────── */

  // 최초 마운트 시 URL → state
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("q");
    const s = sp.get("sort") as SortKey | null;
    if (q) setQuery(q);
    if (s === "hot" || s === "new") setSort(s);
  }, []);

  // state → URL (replaceState로 히스토리 오염 최소화)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    query ? sp.set("q", query) : sp.delete("q");
    sort ? sp.set("sort", sort) : sp.delete("sort");
    const qs = sp.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [query, sort]);

  /* ───────────────── 액션들(좋아요/싫어요/조회수/추가) ───────────────── */

  const toggleLike = (id: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const liked = !p.liked;
        const likes = (p.likes ?? 0) + (liked ? 1 : -1);
        return { ...p, liked, likes };
      })
    );
  };

  const vote = (id: string, dir: 1 | -1) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        if (dir > 0) {
          // 업보트
          return {
            ...p,
            likes: (p.likes ?? 0) + 1,
            liked: true,
            // 업보트 시 다운보트 표시를 해제하고 싶다면:
            disliked: false,
          };
        } else {
          // 다운보트
          return {
            ...p,
            dislikes: (p.dislikes ?? 0) + 1,
            disliked: true,
            // 다운보트 시 업보트 표시를 해제하고 싶다면:
            liked: false,
            likes: p.liked ? Math.max((p.likes ?? 0) - 1, 0) : (p.likes ?? 0),
          };
        }
      })
    );
  };

  const incView = (id: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, views: (p.views ?? 0) + 1 } : p))
    );
  };

  const addPost = async (input: NewPostInput): Promise<string> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300';
      const response = await fetch(`${apiUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 나중에 인증 토큰 추가 필요
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: input.title,
          content: input.body,
          category_id: input.boardId,
          tags: input.tags,
          is_anonymous: false, // 기본값, 나중에 폼에서 받도록 수정
        }),
      });

      if (!response.ok) {
        throw new Error(`게시글 작성 실패: ${response.status}`);
      }

      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        // 새 게시글을 로컬 상태에 추가 (옵티미스틱 업데이트)
        const newPost: Post = {
          id: String(responseData.data.post_id),
          boardId: input.boardId,
          title: input.title,
          body: input.body,
          author: input.author,
          createdAt: responseData.data.created_at || new Date().toISOString(),
          tags: input.tags ?? [],
          views: 0,
          likes: 0,
          dislikes: 0,
          liked: false,
          disliked: false,
          excerpt: input.body.slice(0, 120),
        };

        setPosts(prev => [newPost, ...prev]);
        return String(responseData.data.post_id);
      } else {
        throw new Error('API 응답이 올바르지 않습니다');
      }
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      // 실패 시 로컬에만 추가 (임시)
      const id = String(Date.now());
      const createdAt = new Date().toISOString();
      const excerpt = input.body.slice(0, 120);

      const newPost: Post = {
        id,
        boardId: input.boardId,
        title: input.title,
        body: input.body,
        author: input.author,
        createdAt,
        tags: input.tags ?? [],
        views: 0,
        likes: 0,
        dislikes: 0,
        liked: false,
        disliked: false,
        excerpt,
      };

      setPosts(prev => [newPost, ...prev]);
      return id;
    }
  };

  /* ───────────────── 정렬/검색 파이프 ───────────────── */

  // 인기 점수(시간 감쇠 포함)
  const hotScore = (p: Post) => {
    const up = p.likes ?? 0;
    const down = p.dislikes ?? 0;
    const score = Math.max(up - down, 0);
    const order = Math.log10(Math.max(score, 1));
    const epoch = 1_700_000_000; // 고정 기준(초)
    const t = (Date.parse(p.createdAt) / 1000) - epoch;
    // 5일 하프라이프 느낌으로 시간 가중
    return order + t / (60 * 60 * 24 * 5);
  };

  const items = useMemo(() => {
    let list = posts;

    // 검색(간단 스코어링)
    const q = query.trim().toLowerCase();
    if (q) {
      const score = (p: Post) =>
        (p.title.toLowerCase().includes(q) ? 3 : 0) +
        ((p.excerpt ?? "").toLowerCase().includes(q) ? 2 : 0) +
        (p.tags?.some(t => t.toLowerCase().includes(q)) ? 1 : 0);

      list = list
        .map(p => ({ p, s: score(p) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map(x => x.p);
    }

    // 정렬
    if (sort === "new") {
      list = [...list].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
      );
    } else {
      list = [...list].sort((a, b) => hotScore(b) - hotScore(a));
    }

    return list;
  }, [posts, query, sort]);

  const value: Ctx = {
    posts,
    items,
    query,
    sort,
    setQuery,
    setSort,
    toggleLike,
    vote,
    addPost,
    incView,
  };

  return <PostsCtx.Provider value={value}>{children}</PostsCtx.Provider>;
}

export function usePosts() {
  const v = useContext(PostsCtx);
  if (!v) throw new Error("usePosts must be used within PostsProvider");
  return v;
}
