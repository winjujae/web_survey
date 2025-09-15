// src/lib/api.ts
import type { Post } from "@/types/post";
import type { components } from "@/types/generated/openapi";
type CreatePostDto = components["schemas"]["CreatePostDto"];
type UpdatePostDto = components["schemas"]["UpdatePostDto"];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3300';

// 백엔드 게시글 데이터를 프론트엔드 타입으로 변환
export function transformPost(post: any): Post {
  return {
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
    liked: false,
  };
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
    const responseData = await apiRequest('/api/posts');
    
    if (!responseData.success || !Array.isArray(responseData.data)) {
      console.warn('API 응답 형식이 올바르지 않습니다:', responseData);
      return [];
    }
    
    return responseData.data.map(transformPost);
  } catch (error) {
    console.error('게시글 목록 로딩 실패:', error);
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

// 댓글 생성
export async function createComment(input: {
  post_id: string;
  content: string;
  parent_comment_id?: string;
  is_anonymous?: boolean;
  anonymous_nickname?: string;
}) {
  const responseData = await apiRequest(`/api/comments`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!responseData.success || !responseData.data) {
    throw new Error('댓글 등록에 실패했습니다.');
  }

  return responseData.data;
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
