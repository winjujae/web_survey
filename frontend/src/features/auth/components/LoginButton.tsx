///src/features/auth/components/LoginButton.tsx
"use client";
import { useState } from "react";
import LoginModal from "./LoginModal";

export default function LoginButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>로그인</button>
      {open && <LoginModal open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
