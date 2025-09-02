//src/features/posts/components/NewPostModal.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { usePosts } from "@/features/posts/posts-context";
import { useLoginDialog } from "@/features/auth/components/LoginDialogProvider";
import { useAuth } from "@/features/auth/auth-context";

export default function NewPostModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { user } = useAuth();
  const { posts, /* 원한다면 addPost API를 컨텍스트에 추가해서 사용 */ } = usePosts();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [boardId, setBoardId] = useState<string>("talk"); // 기본 보드
  const [tags, setTags] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => { e.preventDefault(); onClose(); };
    el.addEventListener("cancel", onCancel);
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
    return () => el.removeEventListener("cancel", onCancel);
  }, [open, onClose]);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-modal="true"
      aria-labelledby="newPostTitle"
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 id="newPostTitle">새 글 쓰기</h2>
        {err && <p style={{ color: "var(--danger)" }}>{err}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!user) { setErr("로그인이 필요합니다."); return; }
            if (!title.trim()) { setErr("제목을 입력하세요."); return; }

            // 아주 간단한 추가(목데이터에 push). 실제로는 컨텍스트에 addPost를 만들어 호출하세요.
            // 여기선 페이지 새로고침 없이 목록에 반영되도록 이벤트만 방출하는 형태를 권장합니다.
            alert("데모: 실제 저장 API 붙이면 여기서 호출하세요.");
            onClose();
          }}
        >
          <div className="row">
            <input
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="row">
            <select value={boardId} onChange={(e) => setBoardId(e.target.value)} style={{ width: "100%" }}>
              <option value="talk">소통하기</option>
              <option value="finasteride">피나스테리드</option>
              <option value="minoxidil">미녹시딜</option>
              <option value="transplant">모발이식 후기</option>
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
            <button type="button" className="btn" onClick={onClose}>취소</button>
            <button type="submit" className="btn btn-primary">등록</button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
