"use client";
import { useAuth } from "./auth-context";
import { useLoginDialog } from "./components/LoginDialogProvider";

export function useAuthGuard() {
  const { user } = useAuth();
  const { openLogin } = useLoginDialog();

  return (fn: () => void) => () => {
    if (!user) { openLogin(); return; }
    fn();
  };
}
