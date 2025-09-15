// src/components/containers/PostDetailContainer.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatKSTDateTime } from "@/lib/time";
import type { Post } from "@/types/post";
import { useAuth } from "@/features/auth/auth-context";
import { updatePost, deletePost, toggleLike } from "@/lib/api";

interface PostDetailContainerProps {
  post: Post;
}

export default function PostDetailContainer({ post: initialPost }: PostDetailContainerProps) {
  const [post, setPost] = useState(initialPost);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editBody, setEditBody] = useState(post.body);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // 좋아요 토글
  const handleLike = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const result = await toggleLike(post.id /* , user.token */);
      setPost(prev => ({
        ...prev,
        liked: result.liked,
        likes: result.likes,
      }));
    } catch (error) {
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
      {user && (
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
    </article>
  );
}
