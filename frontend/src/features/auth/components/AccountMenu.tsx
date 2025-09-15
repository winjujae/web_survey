"use client";
import { useState } from "react";
import { useAuth } from "../auth-context";

export default function AccountMenu() {
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading || !user) return null;

  const initial = (user.name || user.handle || "U")[0].toUpperCase();

  return (
    <div style={{ position: "relative" }}>
      <div className="avatar" role="button" aria-label="내 프로필" onClick={() => setOpen(v => !v)}>
        {initial}
      </div>
      {open && (
        <div className="panel" style={{ position: "absolute", right: 0, top: "120%", minWidth: 220 }}>
          <div style={{ padding: 12 }}>
            <div style={{ fontWeight: 700 }}>@{user.handle}</div>
            <div style={{ color: "var(--muted)" }}>{user.name}</div>
          </div>
          <div className="nav-list">
            <a className="nav-item" href="/profile">👤 내 프로필</a>
            <a className="nav-item" href="/settings">⚙️ 계정 설정</a>
            <a className="nav-item" onClick={async (e) => { e.preventDefault(); await logout(); }}>
              🚪 로그아웃
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
