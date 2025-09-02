//src/features/auth/components/LoginModal.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth-context";

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
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
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 id="loginTitle">로그인</h2>
        {err && <p style={{ color: "var(--danger)" }}>{err}</p>}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setLoading(true);
              await login({ email, password: pw });
              onClose();
            } catch (e: any) {
              setErr(e.message ?? "로그인 실패");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="row">
            <input placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
          </div>
          <div className="row">
            <input type="password" placeholder="비밀번호" value={pw} onChange={e => setPw(e.target.value)} />
          </div>
          <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="btn" onClick={onClose} disabled={loading}>취소</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "로그인 중…" : "확인"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
