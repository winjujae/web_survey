# 🏥 탈모 커뮤니티 플랫폼

NestJS + TypeScript + TypeORM + Neon 기반의 종합적인 탈모 커뮤니티 플랫폼입니다.

## 📋 프로젝트 개요

이 프로젝트는 탈모로 고민하는 사람들이 서로 소통하고 정보를 공유할 수 있는 커뮤니티 플랫폼입니다. 전문가 상담, 제품 리뷰, 병원 정보, 치료 경험 공유 등의 기능을 제공합니다.

### ✨ 주요 기능

- 🔐 **회원가입/로그인** (소셜 로그인 포함)
- 📝 **게시글 작성/수정/삭제** (일반/익명 게시글)
- 💬 **댓글/대댓글 시스템**
- ❤️ **좋아요, 북마크, 공유 기능**
- 👤 **프로필/마이페이지** (내 글, 내 댓글, 내 북마크 모아보기)
- 🏥 **병원 정보 게시판**
- 💊 **제품/약물 정보 및 리뷰**
- 👨‍⚕️ **전문가 Q&A 시스템**
- ⚠️ **신고 기능 및 관리자 페이지**
- 📢 **알림 시스템**
- 🔍 **통합 검색 기능**

## 🛠️ 기술 스택

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL (Neon), TypeORM
- **Authentication**: JWT, Passport.js
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger (추후 추가 예정)

## 🚀 설치 및 실행

### 필수 요구사항

- Node.js (v16 이상)
- npm 또는 yarn
- PostgreSQL 데이터베이스 (Neon 권장)

### 환경 설정

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경변수 설정**
   ```bash
   cp .env.example .env
   ```

   `.env` 파일을 열어서 다음 정보를 설정하세요:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-token-secret-key-change-this-in-production

   # Application
   NODE_ENV=development
   PORT=3000

   # File Upload
   MAX_FILE_SIZE=5242880
   UPLOAD_DEST=./uploads
   ```

3. **데이터베이스 마이그레이션**
   ```bash
   npm run start:dev
   ```
   (TypeORM의 `synchronize: true` 설정으로 자동으로 테이블이 생성됩니다)

### 실행

```bash
# 개발 모드
npm run start:dev

# 프로덕션 모드
npm run start:prod

# 빌드
npm run build
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 📚 API 문서

### 🔐 인증 API

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/api/auth/register` | 회원가입 | ❌ |
| POST | `/api/auth/login` | 로그인 | ❌ |
| POST | `/api/auth/logout` | 로그아웃 | ✅ |
| POST | `/api/auth/refresh` | 토큰 갱신 | ✅ |
| GET | `/api/auth/profile` | 프로필 조회 | ✅ |
| PUT | `/api/auth/profile` | 프로필 수정 | ✅ |

### 📝 게시글 API

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | `/api/posts` | 게시글 목록 (페이징, 필터링) | ❌ |
| GET | `/api/posts/:id` | 특정 게시글 조회 | ❌ |
| POST | `/api/posts` | 게시글 작성 | ✅ |
| PUT | `/api/posts/:id` | 게시글 수정 | ✅ |
| DELETE | `/api/posts/:id` | 게시글 삭제 | ✅ |
| POST | `/api/posts/:id/like` | 좋아요 토글 | ✅ |
| POST | `/api/posts/:id/bookmark` | 북마크 토글 | ✅ |
| GET | `/api/posts/search/:keyword` | 게시글 검색 | ❌ |
| GET | `/api/posts/user/:userId` | 사용자별 게시글 | ❌ |

### 💬 댓글 API

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | `/api/comments` | 댓글 목록 | ❌ |
| POST | `/api/comments` | 댓글 작성 | ✅ |
| PUT | `/api/comments/:id` | 댓글 수정 | ✅ |
| DELETE | `/api/comments/:id` | 댓글 삭제 | ✅ |
| POST | `/api/comments/:id/like` | 댓글 좋아요 | ✅ |
| GET | `/api/comments/post/:postId` | 게시글별 댓글 | ❌ |
| GET | `/api/comments/user/:userId` | 사용자별 댓글 | ❌ |
| GET | `/api/comments/:id/replies` | 대댓글 조회 | ❌ |

### 👤 사용자 API

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | `/api/users/:id` | 사용자 정보 조회 | ❌ |
| PATCH | `/api/users/:id` | 사용자 정보 수정 | ✅ |
| DELETE | `/api/users/:id` | 사용자 삭제 | ✅ |
| GET | `/api/users/:id/profile` | 프로필 조회 | ❌ |
| GET | `/api/users/:id/stats` | 사용자 통계 | ❌ |
| GET | `/api/users/me/profile` | 내 프로필 | ✅ |
| GET | `/api/users/me/stats` | 내 통계 | ✅ |
| GET | `/api/users/me/posts` | 내 게시글 | ✅ |
| GET | `/api/users/me/comments` | 내 댓글 | ✅ |
| GET | `/api/users/me/bookmarks` | 내 북마크 | ✅ |

## 🔍 API 사용 예시

### 회원가입
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "nickname": "사용자닉네임"
  }'
```

### 게시글 작성
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "탈모 치료 후기",
    "content": "6개월간의 치료 과정과 결과를 공유합니다...",
    "type": "general",
    "is_anonymous": false
  }'
```

### 게시글 목록 조회
```bash
curl "http://localhost:3000/api/posts?page=1&limit=10&sortBy=created_at&sortOrder=DESC"
```

## 🗄️ 데이터베이스 구조

### 주요 엔티티

- **User**: 사용자 정보
- **Post**: 게시글
- **Comment**: 댓글 (대댓글 지원)
- **Bookmark**: 북마크
- **Report**: 신고
- **Category**: 카테고리
- **Notification**: 알림
- **Expert**: 전문가
- **Hospital**: 병원
- **Product**: 제품
- **Review**: 리뷰

### ERD 관계

```
User 1:N Post, Comment, Bookmark, Report, Notification, Review
User 1:1 Expert

Post 1:N Comment, Bookmark, Report
Post N:1 Category

Comment 1:N Comment (대댓글), Report
Comment N:1 Post, User

Hospital 1:N Review
Product 1:N Review
```

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# e2e 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## 📁 프로젝트 구조

```
src/
├── auth/                    # 인증 모듈
│   ├── dto/                # DTO
│   ├── guards/             # 가드
│   ├── strategies/         # 전략
│   └── ...
├── users/                  # 사용자 모듈
├── posts/                  # 게시글 모듈
├── comments/               # 댓글 모듈
├── bookmarks/              # 북마크 모듈
├── reports/                # 신고 모듈
├── categories/             # 카테고리 모듈
├── notifications/          # 알림 모듈
├── experts/                # 전문가 모듈
├── hospitals/              # 병원 모듈
├── products/               # 제품 모듈
├── reviews/                # 리뷰 모듈
├── configs/                # 설정
└── ...
```

## 🔒 보안

- JWT 기반 인증
- 비밀번호 암호화 (bcrypt)
- 입력 검증 (class-validator)
- SQL 인젝션 방지 (TypeORM)
- XSS 방지 (입력 sanitization)

## 🚀 배포

### 환경별 설정

1. **개발 환경**: `.env` 파일에 개발용 설정
2. **프로덕션 환경**: 환경변수로 설정, `NODE_ENV=production`

### 권장 배포 방식

- **Vercel**: 간단한 배포
- **Railway**: 풀스택 배포
- **AWS**: 확장성 있는 배포
- **Docker**: 컨테이너화 배포

## 🤝 기여

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 📞 문의

프로젝트 관련 문의사항은 이슈를 통해 남겨주세요.
