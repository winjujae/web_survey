"use client";
import { useAuth } from "@/features/auth/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { user, loading, updateProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    email: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        email: user.email || "",
      });
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      bio: user?.bio || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

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
      <div className="settings-container">
        <div className="settings-header">
          <h1>계정 설정</h1>
          <p>프로필 정보와 계정 설정을 관리하세요.</p>
        </div>

        <div className="settings-sections">
          {/* 프로필 정보 섹션 */}
          <div className="settings-section">
            <h2>프로필 정보</h2>
            <div className="profile-preview">
              <div className="profile-avatar">
                {initial}
              </div>
              <div className="profile-details">
                <div className="field-group">
                  <label>이름</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      placeholder="이름을 입력하세요"
                    />
                  ) : (
                    <div className="field-value">{user.name || "이름 없음"}</div>
                  )}
                </div>

                <div className="field-group">
                  <label>사용자명</label>
                  <div className="field-value">@{user.handle}</div>
                  <small className="field-note">사용자명은 변경할 수 없습니다.</small>
                </div>

                <div className="field-group">
                  <label>이메일</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      placeholder="이메일을 입력하세요"
                    />
                  ) : (
                    <div className="field-value">{user.email || "이메일 없음"}</div>
                  )}
                </div>

                <div className="field-group">
                  <label>소개</label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="form-textarea"
                      placeholder="자기소개를 입력하세요"
                      rows={3}
                    />
                  ) : (
                    <div className="field-value">{user.bio || "소개가 없습니다."}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="section-actions">
              {isEditing ? (
                <>
                  <button className="btn btn-primary" onClick={handleSave}>
                    저장
                  </button>
                  <button className="btn btn-outline" onClick={handleCancel}>
                    취소
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                  편집
                </button>
              )}
            </div>
          </div>

          {/* 계정 설정 섹션 */}
          <div className="settings-section">
            <h2>계정 설정</h2>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>알림 설정</h3>
                  <p>이메일 및 푸시 알림을 관리합니다.</p>
                </div>
                <button className="btn btn-outline">설정</button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>개인정보 보호</h3>
                  <p>프로필 공개 범위와 개인정보 설정을 관리합니다.</p>
                </div>
                <button className="btn btn-outline">설정</button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>보안</h3>
                  <p>비밀번호 변경 및 보안 설정을 관리합니다.</p>
                </div>
                <button className="btn btn-outline">설정</button>
              </div>
            </div>
          </div>

          {/* 위험 구역 */}
          <div className="settings-section danger-zone">
            <h2>위험 구역</h2>
            <div className="danger-actions">
              <div className="danger-item">
                <div className="danger-info">
                  <h3>계정 삭제</h3>
                  <p>계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
                </div>
                <button className="btn btn-danger">계정 삭제</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
