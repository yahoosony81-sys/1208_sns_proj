# 기본 세팅 완료 상태

## ✅ 완료된 작업

### 1. Tailwind CSS Instagram 컬러 스키마 설정

**파일**: `app/globals.css`

- ✅ Instagram 컬러 변수 추가
  - `--instagram-blue`: #0095f6
  - `--instagram-background`: #fafafa
  - `--instagram-card`: #ffffff
  - `--instagram-border`: #dbdbdb
  - `--instagram-text-primary`: #262626
  - `--instagram-text-secondary`: #8e8e8e
  - `--instagram-like`: #ed4956

- ✅ Tailwind 테마에 등록
  - `bg-instagram-background`, `text-instagram-text-primary` 등의 클래스 사용 가능

- ✅ 타이포그래피 설정
  - 폰트 패밀리: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - 텍스트 크기: 12px, 14px, 16px, 20px
  - 폰트 굵기: 400, 600, 700

### 2. TypeScript 타입 정의

**파일**: `lib/types.ts`

- ✅ 데이터베이스 테이블 타입
  - `User`, `Post`, `Like`, `Comment`, `Follow`

- ✅ 뷰 타입
  - `PostStats`, `UserStats`

- ✅ API 응답 타입
  - `PostWithUser`, `CommentWithUser`

- ✅ 폼 타입
  - `CreatePostForm`, `CreateCommentForm`

- ✅ 유틸리티 타입
  - `PaginationParams`, `ApiError`

### 3. Supabase Storage 버킷 마이그레이션 파일

**파일**: `supabase/migrations/setup_posts_storage.sql`

- ✅ posts 버킷 생성 SQL
  - 공개 읽기 활성화
  - 5MB 파일 크기 제한
  - 이미지 파일만 허용 (jpeg, png, webp)

- ✅ Storage 정책 설정
  - 공개 읽기 정책
  - 인증된 사용자 업로드 정책
  - 본인만 삭제/업데이트 정책

### 4. 문서화

**파일**: `docs/setup-migration-guide.md`

- ✅ Supabase 마이그레이션 적용 가이드
- ✅ Storage 버킷 설정 가이드
- ✅ 검증 방법 및 문제 해결

## ⚠️ 수동 작업 필요 (Supabase Dashboard)

다음 작업은 Supabase Dashboard에서 직접 수행해야 합니다:

### 1. 데이터베이스 마이그레이션 적용

1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/db.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 후 실행
4. 테이블 생성 확인 (users, posts, likes, comments, follows)
5. 뷰 및 트리거 확인

**상세 가이드**: [docs/setup-migration-guide.md](./setup-migration-guide.md#1-데이터베이스-마이그레이션-적용)

### 2. Storage 버킷 설정

1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/setup_posts_storage.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 후 실행
4. Storage → Buckets에서 `posts` 버킷 생성 확인
5. Storage → Policies에서 정책 확인

**상세 가이드**: [docs/setup-migration-guide.md](./setup-migration-guide.md#2-storage-버킷-설정)

## 검증 방법

### 코드 검증

1. **Tailwind CSS 클래스 테스트**
   ```tsx
   <div className="bg-instagram-background text-instagram-text-primary">
     Instagram 스타일 테스트
   </div>
   ```

2. **TypeScript 타입 import 테스트**
   ```typescript
   import { User, Post, PostWithUser } from '@/lib/types';
   ```

3. **빌드 테스트**
   ```bash
   pnpm build
   ```

### 데이터베이스 검증

Supabase Dashboard에서 다음을 확인:

1. **Table Editor**: 5개 테이블 (users, posts, likes, comments, follows)
2. **Database → Views**: 2개 뷰 (post_stats, user_stats)
3. **Database → Triggers**: set_updated_at 트리거
4. **Storage → Buckets**: posts 버킷 존재

## 다음 단계

기본 세팅이 완료되면 다음 작업을 진행하세요:

1. **레이아웃 구조** (TODO.md ## 2)
   - Sidebar 컴포넌트
   - Header 컴포넌트 (Mobile)
   - BottomNav 컴포넌트 (Mobile)

2. **홈 피드 페이지** (TODO.md ## 3)
   - PostCard 컴포넌트
   - PostFeed 컴포넌트
   - API 라우트

## 참고 파일

- `app/globals.css` - Tailwind CSS 설정
- `lib/types.ts` - TypeScript 타입 정의
- `supabase/migrations/db.sql` - 데이터베이스 스키마
- `supabase/migrations/setup_posts_storage.sql` - Storage 버킷 설정
- `docs/setup-migration-guide.md` - 마이그레이션 적용 가이드


