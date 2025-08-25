# 탈모 커뮤니티 (Hairloss Community)

React + Nest.js + Neon(PostgreSQL) 기반으로 만든 **탈모 커뮤니티 사이트**입니다.  
민감한 주제 특성을 반영해 **익명성**, **정보 공유**, **병원·제품 리뷰** 기능을 지원합니다.

---

## 🚀 목적
- 사용자들이 **탈모 경험, 치료 후기, 제품·병원 정보**를 자유롭게 공유
- 전문가 Q&A, 칼럼 등 **신뢰 기반 정보 교류** 제공
- 익명·닉네임 기반 게시로 **참여 장벽 최소화**

---

## 🛠 기술 스택

### 프런트엔드
- **React + TypeScript**
- **Tailwind CSS**
- React Query / Axios (API 요청 & 캐싱)
- 이미지 업로드/프리뷰, 모바일 대응(PWA)

### 백엔드
- **Nest.js** (모듈화 아키텍처)
- **Neon (PostgreSQL)**
- JWT 인증 + OAuth (구글/네이버/카카오)
- AWS S3 / Cloudinary (이미지 저장)
- WebSocket + Redis (실시간 알림)

### 배포
- Frontend: Vercel
- Backend: Docker + Render/Fly.io
- DB: Neon(Postgres Cloud)

---

## 📌 핵심 기능
- 회원가입/로그인 (소셜 로그인 포함), 프로필/마이페이지
- 게시글 CRUD + 카테고리/검색/필터링
- 댓글/대댓글, 좋아요/북마크
- 이미지 첨부 (전후 사진, 진단 사진 등)
- 익명/닉네임 게시
- 병원/제품 후기 + 평점 리뷰
- 신고/관리자 기능
- 전문가 인증 + Q&A
- 실시간 알림 (댓글, 좋아요, 신고)

---

## ▶️ 실행 방법 (로컬)

```bash
# 백엔드
cd backend
npm install
npm run start:dev

# 프런트엔드
cd frontend
npm install
npm run dev
```
