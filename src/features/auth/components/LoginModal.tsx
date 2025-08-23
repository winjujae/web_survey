"use client";
import { useState } from "react";
import { useAuth } from "../auth-context";

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  if (!open) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: 420 }}>
        <h2>로그인</h2>
        <div className="row"><input placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="row"><input type="password" placeholder="비밀번호" value={pw} onChange={e => setPw(e.target.value)} /></div>
        {err && <p style={{ color: "var(--danger)" }}>{err}</p>}
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={async () => {
            try { await login({ email, password: pw }); onClose(); }
            catch (e: any) { setErr(e.message ?? "로그인 실패"); }
          }}>확인</button>
        </div>
      </div>
    </div>
  );
}
