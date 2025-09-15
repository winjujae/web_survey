// src/app/components/UserBadge.tsx
"use client";
import { useAuth } from "@/features/auth/auth-context";
import LoginButton from "@/features/auth/components/LoginButton";
import AccountMenu from "@/features/auth/components/AccountMenu";

export default function UserBadge() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <LoginButton />;

  const initial = user.name?.[0]?.toUpperCase() ?? "U";

  return (
    <AccountMenu/>
  );
}
