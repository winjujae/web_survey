"use client";
import { useAuth } from "@/features/auth/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMyStats, type MyStats } from "@/lib/api";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<MyStats | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user) {
      fetchMyStats().then(setStats).catch(() => setStats(null));
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initial = (user.name || user.handle || "U")[0].toUpperCase();

  return (
    <div className="container">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {initial}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user.name || "이름 없음"}</h1>
            <p className="profile-handle">@{user.handle}</p>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-number">{stats?.total_posts ?? 0}</div>
            <div className="stat-label">게시글</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats?.total_comments ?? 0}</div>
            <div className="stat-label">댓글</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats?.likes_received ?? 0}</div>
            <div className="stat-label">좋아요</div>
          </div>
        </div>

        <div className="profile-actions">
          <button 
            className="btn btn-primary"
            onClick={() => router.push("/settings")}
          >
            프로필 편집
          </button>
        </div>

        <div className="profile-content">
          <div className="content-tabs">
            <button className="tab-button active">게시글</button>
            <button className="tab-button">댓글</button>
            <button className="tab-button">북마크</button>
          </div>
          
          <div className="content-area">
            <div className="empty-state">
              <p>아직 작성한 게시글이 없습니다.</p>
              <button 
                className="btn btn-outline"
                onClick={() => router.push("/posts/new")}
              >
                첫 게시글 작성하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
