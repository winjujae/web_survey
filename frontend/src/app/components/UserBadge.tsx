"use client";
import { useAuth } from "@/features/auth/auth-context";
import LoginButton from "@/features/auth/components/LoginButton";
import AccountMenu from "@/features/auth/components/AccountMenu";

export default function UserBadge() {
  const { user, loading } = useAuth();

  if (loading) return null;      // 초기 로딩 중엔 깜빡임 방지
  if (!user) return <LoginButton />;

  const initial = user.name?.[0]?.toUpperCase() ?? "U";
  return (
    <div className="btn" style={{gap:8}}>
      {user.avatar
        ? <img src={user.avatar} alt={user.name} style={{width:22,height:22,borderRadius:7}} />
        : <div className="avatar mini">{initial}</div>}
      <AccountMenu />
    </div>
  );
}
