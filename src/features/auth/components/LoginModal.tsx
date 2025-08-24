// LoginModal.tsx (dialog 버전)
"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth-context";

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => { e.preventDefault(); onClose(); }; // ESC
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
      aria-labelledby="loginTitle"
      onClick={(e) => {
        // 배경(=dialog 자신)을 클릭한 경우만 닫기
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 id="loginTitle">로그인</h2>
        <div className="row"><input placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="row"><input type="password" placeholder="비밀번호" value={pw} onChange={e => setPw(e.target.value)} /></div>
        {err && <p style={{ color: "var(--danger)" }}>{err}</p>}
        <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button className="btn" onClick={onClose}>취소</button>
          <button
            className="btn btn-primary"
            onClick={async () => {
              try { await login({ email, password: pw }); onClose(); }
              catch (e: any) { setErr(e.message ?? "로그인 실패"); }
            }}
          >확인</button>
        </div>
      </div>
    </dialog>
  );
}
