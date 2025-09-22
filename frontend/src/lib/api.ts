// src/lib/api.ts
import type { Post, Comment as UiComment } from "@/types/post";
import type { components } from "@/types/generated/openapi";
type CreatePostDto = components["schemas"]["CreatePostDto"];
type UpdatePostDto = components["schemas"]["UpdatePostDto"];
type PostViewDto = components["schemas"]["PostViewDto"];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3300';

// 백엔드 게시글 데이터를 프론트엔드 타입으로 변환
export function transformPost(post: PostViewDto): Post {
  return {
    id: String(post.id ?? ""),
    boardId: String(post.boardId ?? ""),
    title: String(post.title ?? "(제목 없음)"),
    excerpt: String((post.body ?? "").substring(0, 100)),
    body: String(post.body ?? ""),
    author: String(post.author ?? "작성자"),
    createdAt: String(post.createdAt ?? new Date().toISOString()),
    tags: Array.isArray(post.tags) ? post.tags : [],
    likes: Number(post.likes ?? 0),
    views: Number(post.views ?? 0),
    dislikes: Number(post.dislikes ?? 0),
    liked: false,
    disliked: false,
  };
}

// 백엔드 댓글 → 프론트 댓글 타입으로 변환
// 백엔드: { comment_id, user_id, content, created_at }
function transformComment(raw: any): UiComment {
  const c: UiComment = {
    id: String(raw?.comment_id ?? raw?.id ?? ""),
    // 닉네임 우선 표시, 없으면 user_id
    userId: String(raw?.user?.nickname ?? raw?.user_id ?? raw?.userId ?? ""),
    ownerId: String(raw?.user_id ?? raw?.user?.user_id ?? ""),
    body: String(raw?.content ?? raw?.body ?? ""),
    createdAt: String(raw?.created_at ?? raw?.createdAt ?? new Date().toISOString()),
    status: String(raw?.status ?? "active").toLowerCase() === 'deleted' ? 'deleted' : 'active',
    parentId: raw?.parent_comment_id ? String(raw.parent_comment_id) : undefined,
    replies: Array.isArray(raw?.replies) ? raw.replies.map(transformComment) : undefined,
  };
  return c;
}

// 공통 fetch 함수 (Next.js 15 캐싱 정책 적용)
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function isSafeMethod(method: string | undefined): boolean {
  const m = (method || 'GET').toUpperCase();
  return m === 'GET' || m === 'HEAD' || m === 'OPTIONS';
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (!isSafeMethod(options.method)) {
    const csrf = getCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  const response = await fetch(url, {
    ...options,
    // Next.js 15: 기본적으로 캐싱되지 않음, 명시적 캐싱 설정
    cache: 'no-store', // 항상 최신 데이터 가져오기
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status}`);
  }

  return response.json();
}

// 게시글 목록 조회
export async function fetchPosts(): Promise<Post[]> {
  try {
    if (process.env.NODE_ENV !== 'production') console.log('[DBG] fetchPosts: request /api/posts');
    const responseData = await apiRequest('/api/posts');
    if (process.env.NODE_ENV !== 'production') console.log('[DBG] fetchPosts: response', responseData);
    
    if (!responseData.success || !Array.isArray(responseData.data)) {
      console.warn('API 응답 형식이 올바르지 않습니다:', responseData);
      return [];
    }
    
    const mapped = responseData.data.map(transformPost);
    if (process.env.NODE_ENV !== 'production') console.log('[DBG] fetchPosts: mapped length', mapped.length);
    return mapped;
  } catch (error) {
    console.error('[ERR] fetchPosts failed:', error);
    return [];
  }
}

// 특정 게시글 조회
export async function fetchPost(id: string): Promise<Post | null> {
  try {
    const responseData = await apiRequest(`/api/posts/${id}`);
    
    if (!responseData.success || !responseData.data) {
      return null;
    }
    
    return transformPost(responseData.data);
  } catch (error) {
    console.error('게시글 로딩 실패:', error);
    return null;
  }
}

// 게시글 생성
export async function createPost(postData: CreatePostDto, token?: string): Promise<Post> {
  const responseData = await apiRequest('/api/posts', {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(postData),
  });

  if (!responseData.success || !responseData.data) {
    throw new Error('게시글 작성에 실패했습니다.');
  }

  return transformPost(responseData.data);
}

// 게시글 수정
export async function updatePost(
  id: string,
  postData: UpdatePostDto,
  token?: string
): Promise<Post> {
  const responseData = await apiRequest(`/api/posts/${id}`, {
    method: 'PATCH',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(postData),
  });

  if (!responseData.success || !responseData.data) {
    throw new Error('게시글 수정에 실패했습니다.');
  }

  return transformPost(responseData.data);
}

// 게시글 삭제
export async function deletePost(id: string, token?: string): Promise<void> {
  const responseData = await apiRequest(`/api/posts/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!responseData.success) {
    throw new Error('게시글 삭제에 실패했습니다.');
  }
}

// 좋아요 토글
export async function toggleLike(id: string, token?: string): Promise<{ liked: boolean; likes: number }> {
  const responseData = await apiRequest(`/api/posts/${id}/like`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!responseData.success || !responseData.data) {
    throw new Error('좋아요 처리에 실패했습니다.');
  }

  return responseData.data;
}

// 북마크 토글
export async function toggleBookmark(id: string, token?: string): Promise<{ bookmarked: boolean }> {
  const responseData = await apiRequest(`/api/posts/${id}/bookmark`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!responseData.success || !responseData.data) {
    throw new Error('북마크 처리에 실패했습니다.');
  }

  return responseData.data;
}

// 싫어요 토글
export async function toggleDislike(id: string, token?: string): Promise<{ disliked: boolean; dislikes: number }> {
  const responseData = await apiRequest(`/api/posts/${id}/dislike`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!responseData.success || !responseData.data) {
    throw new Error('싫어요 처리에 실패했습니다.');
  }

  return responseData.data;
}

// 조회수 증가
export async function incrementView(id: string): Promise<void> {
  const responseData = await apiRequest(`/api/posts/${id}/view`, {
    method: 'POST',
  });

  if (!responseData.success) {
    throw new Error('조회수 증가에 실패했습니다.');
  }
}

// 댓글 생성
export async function createComment(input: {
  post_id: string;
  content: string;
  parent_comment_id?: string;
  is_anonymous?: boolean;
  anonymous_nickname?: string;
}): Promise<UiComment> {
  const responseData = await apiRequest(`/api/comments`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!responseData.success || !responseData.data) {
    throw new Error('댓글 등록에 실패했습니다.');
  }

  return transformComment(responseData.data);
}

// 댓글 목록 조회 (부모 댓글 + 대댓글 포함 반환 가정)
export async function fetchPostComments(postId: string): Promise<UiComment[]> {
  const responseData = await apiRequest(`/api/comments/post/${postId}`);

  if (!responseData.success || !Array.isArray(responseData.data)) {
    return [];
  }

  return responseData.data.map(transformComment);
}

// 댓글 수정
export async function updateComment(
  id: string,
  input: { content: string }
): Promise<UiComment> {
  const responseData = await apiRequest(`/api/comments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

  if (!responseData.success || !responseData.data) {
    throw new Error('댓글 수정에 실패했습니다.');
  }

  return transformComment(responseData.data);
}

// 댓글 삭제
export async function deleteComment(id: string): Promise<void> {
  const responseData = await apiRequest(`/api/comments/${id}`, {
    method: 'DELETE',
  });

  if (!responseData.success) {
    throw new Error('댓글 삭제에 실패했습니다.');
  }
}

// 카테고리별 게시글 조회
export async function fetchPostsByCategory(
  categoryId: string,
  page = 1,
  limit = 10
): Promise<{ posts: Post[]; total: number; totalPages: number }> {
  try {
    const responseData = await apiRequest(
      `/api/posts?category_id=${categoryId}&page=${page}&limit=${limit}`,
      { cache: 'no-store' }
    );
    
    if (!responseData.success || !Array.isArray(responseData.data)) {
      console.warn('API 응답 형식이 올바르지 않습니다:', responseData);
      return { posts: [], total: 0, totalPages: 0 };
    }
    
    return {
      posts: responseData.data.map(transformPost),
      total: responseData.pagination?.totalItems || 0,
      totalPages: responseData.pagination?.totalPages || 0,
    };
  } catch (error) {
    console.error('카테고리별 게시글 로딩 실패:', error);
    return { posts: [], total: 0, totalPages: 0 };
  }
}

// 게시글 검색
export async function searchPosts(
  keyword: string,
  page = 1,
  limit = 10
): Promise<{ posts: Post[]; total: number; totalPages: number }> {
  try {
    const responseData = await apiRequest(
      `/api/posts/search/${encodeURIComponent(keyword)}?page=${page}&limit=${limit}`,
      { cache: 'no-store' }
    );
    
    if (!responseData.success || !Array.isArray(responseData.data)) {
      console.warn('API 응답 형식이 올바르지 않습니다:', responseData);
      return { posts: [], total: 0, totalPages: 0 };
    }
    
    return {
      posts: responseData.data.map(transformPost),
      total: responseData.search?.totalResults || 0,
      totalPages: responseData.pagination?.totalPages || 0,
    };
  } catch (error) {
    console.error('게시글 검색 실패:', error);
    return { posts: [], total: 0, totalPages: 0 };
  }
}
