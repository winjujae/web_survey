"use client";
import { createContext, useContext, useState, useMemo } from "react";
import LoginModal from "./LoginModal";

type Ctx = { openLogin: () => void; closeLogin: () => void };
const LoginDialogCtx = createContext<Ctx | null>(null);

export function LoginDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ openLogin: () => setOpen(true), closeLogin: () => setOpen(false) }), []);
  return (
    <LoginDialogCtx.Provider value={value}>
      {children}
      {open && <LoginModal open={open} onClose={() => setOpen(false)} />}
    </LoginDialogCtx.Provider>
  );
}

export const useLoginDialog = () => {
  const v = useContext(LoginDialogCtx);
  if (!v) throw new Error("useLoginDialog must be used within LoginDialogProvider");
  return v;
};
