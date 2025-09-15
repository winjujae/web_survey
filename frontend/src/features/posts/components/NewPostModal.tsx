//src/features/posts/components/NewPostModal.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { createPost } from "@/lib/api";
import { useLoginDialog } from "@/features/auth/components/LoginDialogProvider";
import { useAuth } from "@/features/auth/auth-context";
import { useRouter } from "next/navigation";

export default function NewPostModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [boardId, setBoardId] = useState<string>("talk"); // 기본 보드
  const [tags, setTags] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => { e.preventDefault(); onClose(); };
    el.addEventListener("cancel", onCancel);
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
    return () => el.removeEventListener("cancel", onCancel);
  }, [open, onClose]);
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setErr("로그인이 필요합니다.");
    if (!title.trim()) return setErr("제목을 입력하세요.");
    setErr("");

    try {
      const saved = await createPost({
        title,
        content: body,
        category_id: boardId,
        tags: tags.split(" ").filter(Boolean),
      });
      // 입력값 초기화
      setTitle("");
      setBody("");
      setTags("");
      setErr("");
      onClose();
      router.push(`/posts/${saved.id}`); // 새로고침 없이 상세로 이동
    } catch (e) {
      setErr("저장 중 오류가 발생했어요.");
    }
  };

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-modal="true"
      aria-labelledby="newPostTitle"
      onClick={(e) => {
        // 배경(바깥)을 클릭했을 때만 닫기
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 id="newPostTitle">새 글 쓰기</h2>
        {err && <p style={{ color: "var(--danger)" }}>{err}</p>}

        <form onSubmit={submit}>
          <div className="row">
            <input
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="row">
            <select
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
              style={{ width: "100%" }}
            >
              {/* mock.ts 의 boards: talk / treatment / reviews / clinics */}
              <option value="talk">소통하기</option>
              <option value="treatment">치료/약 정보</option>
              <option value="reviews">관리후기/제품리뷰</option>
              <option value="clinics">지역 병원/클리닉</option>
            </select>
          </div>

          <div className="row">
            <textarea
              placeholder="내용을 입력하세요"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="row">
            <input
              placeholder="#태그 를 공백으로 구분해 입력 (예: 피나스테리드 부작용)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="btn" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              등록
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}