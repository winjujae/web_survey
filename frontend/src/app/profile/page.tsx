"use client";
import { useAuth } from "@/features/auth/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchMyStats, fetchMyPosts, fetchMyComments, fetchMyBookmarks, type MyStats } from "@/lib/api";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<MyStats | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'bookmarks'>('posts');
  const [list, setList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const formatDate = (d?: any) => {
    try {
      return new Date(d ?? new Date()).toLocaleString('ko-KR', { hour12: false });
    } catch {
      return '';
    }
  };

  const getPostId = (item: any): string => String(item?.post_id ?? item?.id ?? item?.post?.post_id ?? "");

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

  useEffect(() => {
    if (!loading || !user) return;
  }, [loading, user]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoadingList(true);
      try {
        if (activeTab === 'posts') {
          const { items } = await fetchMyPosts(1, 10);
          setList(items);
        } else if (activeTab === 'comments') {
          const { items } = await fetchMyComments(1, 10);
          setList(items);
        } else {
          const { items } = await fetchMyBookmarks(1, 10);
          setList(items);
        }
      } finally {
        setLoadingList(false);
      }
    };
    load();
  }, [activeTab, user]);

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
            <button className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>게시글</button>
            <button className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>댓글</button>
            <button className={`tab-button ${activeTab === 'bookmarks' ? 'active' : ''}`} onClick={() => setActiveTab('bookmarks')}>북마크</button>
          </div>

          <div className="content-area">
            {loadingList ? (
              <div className="loading">로딩 중...</div>
            ) : list.length === 0 ? (
              <div className="empty-state">
                <p>{activeTab === 'posts' ? '아직 작성한 게시글이 없습니다.' : activeTab === 'comments' ? '아직 작성한 댓글이 없습니다.' : '아직 북마크한 게시글이 없습니다.'}</p>
                {activeTab === 'posts' && (
                  <button 
                    className="btn btn-outline"
                    onClick={() => router.push("/posts/new")}
                  >
                    첫 게시글 작성하기
                  </button>
                )}
              </div>
            ) : (
              <ul className="list">
                {list.map((item, idx) => {
                  const postId = getPostId(item);
                  if (activeTab === 'posts' || activeTab === 'bookmarks') {
                    return (
                      <li key={idx} className="list-item">
                        <Link href={postId ? `/posts/${postId}` : '#'} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                          <div className="title" style={{ fontWeight: 600 }}>{item.title ?? '(제목 없음)'}</div>
                          <div className="meta" style={{ color: 'var(--muted)' }}>
                            {formatDate(item.created_at || item.createdAt)}
                            {typeof item.view_count === 'number' && (
                              <>
                                <span className="dot" style={{ margin: '0 6px' }}>·</span>
                                조회 {item.view_count}
                              </>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  }
                  // comments
                  return (
                    <li key={idx} className="list-item">
                      <Link href={postId ? `/posts/${postId}` : '#'} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <div className="body" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {item.content ?? item.body ?? ''}
                        </div>
                        <div className="meta" style={{ color: 'var(--muted)' }}>
                          {formatDate(item.created_at || item.createdAt)}
                          {item?.post?.title && (
                            <>
                              <span className="dot" style={{ margin: '0 6px' }}>·</span>
                              원문: {item.post.title}
                            </>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
