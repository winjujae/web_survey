"use client";
import { useState } from "react";
import { useAuth } from "../auth-context";
import LoginModal from "./LoginModal";

export default function LoginButton() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) return null;
  if (user) return null;

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>로그인</button>
      <LoginModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
// src/features/auth/components/LoginButton.tsx --- IGNORE ---