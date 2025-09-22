export type User = {
  id: string;
  handle: string; // @you
  name: string;
  email?: string;
  avatar?: string;
  picture?: string; // 구글 프로필 이미지
  provider?: "email" | "google";
  nickname?: string;
  bio?: string; // 자기소개
  role?: "user" | "admin" | "expert"; // 권한 (백엔드 스키마에 맞춤)
};