// src/components/containers/PostDetailContainer.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatKSTDateTime } from "@/lib/time";
import type { Post, Comment as UiComment } from "@/types/post";
import { useAuth } from "@/features/auth/auth-context";
import { updatePost, deletePost, fetchPostComments } from "@/lib/api";
import CommentForm from "@/components/shared/CommentForm";
import Comments from "@/components/shared/Comments";
import { usePostQuery, usePostMutations } from "@/features/posts/hooks";

interface PostDetailContainerProps {
  post: Post;
}

export default function PostDetailContainer({ post: initialPost }: PostDetailContainerProps) {
  const { data } = usePostQuery(initialPost.id, initialPost);
  const [post, setPost] = useState(data ?? initialPost);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editBody, setEditBody] = useState(post.body);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { like, view } = usePostMutations();

  // 조회수 증가 (하이브리드: 즉시 UI 반영 + 백그라운드 서버 반영)
  useEffect(() => {
    // 1) 즉시 UI 반영 (낙관적 증가)
    setPost(prev => ({
      ...prev,
      views: (prev.views || 0) + 1,
    }));

    // 2) 서버 반영 (실패해도 UI는 유지)
    view.mutate(post.id, {
      // 실패 시 별도 롤백은 하지 않음 (간단한 UX 유지)
      onError: (err) => {
        console.warn('조회수 증가 실패(서버):', err);
      },
    });
  }, [post.id]);

  // 댓글 목록 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await fetchPostComments(post.id);
        if (!mounted) return;
        setPost(prev => ({ ...prev, comments: list }));
      } catch (err) {
        console.warn('댓글 로드 실패:', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [post.id]);

  // 좋아요 토글
  const handleLike = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const result = await like.mutateAsync(post.id);
      setPost(prev => ({
        ...prev,
        liked: result.liked,
        likes: result.likes,
      }));
    } catch (error) {
      console.error("좋아요 실패:", error);
      // 일시적으로 옵티미스틱 업데이트
      setPost(prev => ({
        ...prev,
        liked: !prev.liked,
        likes: (prev.likes || 0) + (prev.liked ? -1 : 1),
      }));
    }
  };

  // 게시글 수정
  const handleEdit = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedPost = await updatePost(
        post.id,
        {
          title: editTitle.trim(),
          content: editBody.trim(),
        }
        /* , user.token */
      );

      setPost(prev => ({
        ...prev,
        title: editTitle.trim(),
        body: editBody.trim(),
        excerpt: editBody.trim().substring(0, 100),
      }));
      setIsEditing(false);
      alert("게시글이 수정되었습니다.");
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      alert("게시글 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 게시글 삭제
  const handleDelete = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!confirm("정말로 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deletePost(post.id /* , user.token */);
      alert("게시글이 삭제되었습니다.");
      router.push("/");
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  // 작성자 또는 관리자 여부 판단 (백엔드에서 내려오는 author 식별자에 맞춰 보정 필요)
  // 권한 판별: 작성자 또는 관리자
  const canManage = !!user && (
    user.id === (post as any).authorId ||
    user.id === (post as any).user_id ||
    user.role === 'admin'
  );

  if (isEditing) {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>제목</label>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="input"
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>내용</label>
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            className="textarea"
            style={{ width: "100%", minHeight: "200px" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button 
            onClick={handleEdit} 
            disabled={isSubmitting || !editTitle.trim() || !editBody.trim()}
            className="btn btn-primary"
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </button>
          <button 
            onClick={() => {
              setIsEditing(false);
              setEditTitle(post.title);
              setEditBody(post.body);
            }}
            className="btn"
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="card" style={{ padding: 16 }}>
      <div className="head-compact">
        <span className="avatar mini">{post.author[0]}</span>
        <span className="handle">{post.author}</span>
        <span className="dot" />
        <time dateTime={post.createdAt}>
          {formatKSTDateTime(post.createdAt)}
        </time>
      </div>
      
      <h1 className="title" style={{ fontSize: 22, marginTop: 12 }}>
        {post.title}
      </h1>
      
      <div className="meta" style={{ marginTop: 6 }}>
        <button 
          onClick={handleLike}
          style={{ 
            background: "none", 
            border: "none", 
            cursor: "pointer",
            color: post.liked ? "#e91e63" : "inherit"
          }}
        >
          ❤ {post.likes ?? 0}
        </button>
        <span className="dot" />
        조회 {post.views ?? 0}
      </div>

      {/* 작성자 또는 관리자만 수정/삭제 버튼 표시 */}
      {canManage && (
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button onClick={() => setIsEditing(true)} className="btn">
            수정
          </button>
          <button onClick={handleDelete} className="btn" style={{ color: "#d32f2f" }}>
            삭제
          </button>
        </div>
      )}
      
      <hr style={{ borderColor: "var(--border)", margin: "12px 0" }} />
      
      <div style={{ whiteSpace: "pre-wrap" }}>{post.body}</div>
      
      {post.tags && post.tags.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {post.tags.map((tag, index) => (
            <span key={index} className="tag-chip" style={{ marginRight: 8 }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 댓글 섹션: 작성 + 목록 */}
      <hr style={{ borderColor: "var(--border)", margin: "16px 0" }} />
      <section aria-label="댓글 섹션" style={{ marginTop: 8 }}>
        <h3 style={{ margin: '8px 0' }}>댓글 쓰기</h3>
        <CommentForm
          postId={post.id}
          onSubmitted={(c) =>
            setPost((prev) => ({ ...prev, comments: [ ...(prev.comments ?? []), c ] }))
          }
        />

        <h3 style={{ margin: '16px 0 8px' }}>댓글 보기</h3>
        <Comments
          postId={post.id}
          comments={post.comments ?? []}
          onUpdated={(updated: UiComment) =>
            setPost(prev => ({
              ...prev,
              comments: (prev.comments ?? []).map(c => c.id === updated.id ? updated : c),
            }))
          }
          onDeleted={(id: string) =>
            setPost(prev => ({
              ...prev,
              comments: (prev.comments ?? []).map(c => c.id === id ? { ...c, status: 'deleted', body: '' } as UiComment : c),
            }))
          }
        />
      </section>
    </article>
  );
}
