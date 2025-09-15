export type User = {
  id: string;
  handle: string; // @you
  name: string;
  email?: string;
  avatar?: string;
  picture?: string; // 구글 프로필 이미지
  provider?: "email" | "google";
  nickname?: string;
};