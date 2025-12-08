# Supabase 마이그레이션 적용 가이드

이 문서는 기본 세팅의 일부인 Supabase 데이터베이스 마이그레이션과 Storage 버킷 설정을 적용하는 방법을 안내합니다.

## 1. 데이터베이스 마이그레이션 적용

### 1.1 Supabase Dashboard에서 마이그레이션 적용

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New query** 버튼 클릭
5. `supabase/migrations/db.sql` 파일을 열어 전체 내용을 복사
6. SQL Editor에 붙여넣기
7. **Run** 버튼 클릭하여 실행
8. 성공 메시지 확인 (`Success. No rows returned` 또는 유사한 메시지)

### 1.2 생성된 테이블 확인

**Table Editor에서 확인:**

1. Supabase Dashboard → **Table Editor**
2. 다음 테이블들이 생성되었는지 확인:
   - `users` - 사용자 정보
   - `posts` - 게시물
   - `likes` - 좋아요
   - `comments` - 댓글
   - `follows` - 팔로우 관계

**각 테이블의 컬럼 확인:**

- **users**: `id`, `clerk_id`, `name`, `created_at`
- **posts**: `id`, `user_id`, `image_url`, `caption`, `created_at`, `updated_at`
- **likes**: `id`, `post_id`, `user_id`, `created_at`
- **comments**: `id`, `post_id`, `user_id`, `content`, `created_at`, `updated_at`
- **follows**: `id`, `follower_id`, `following_id`, `created_at`

### 1.3 뷰(Views) 확인

1. Supabase Dashboard → **Database** → **Views**
2. 다음 뷰들이 생성되었는지 확인:
   - `post_stats` - 게시물 통계 (좋아요 수, 댓글 수)
   - `user_stats` - 사용자 통계 (게시물 수, 팔로워 수, 팔로잉 수)

### 1.4 트리거(Triggers) 확인

1. Supabase Dashboard → **Database** → **Triggers**
2. `set_updated_at` 트리거가 다음 테이블에 적용되었는지 확인:
   - `posts` 테이블
   - `comments` 테이블

## 2. Storage 버킷 설정

### 2.1 posts 버킷 생성

1. Supabase Dashboard → **SQL Editor**
2. **New query** 버튼 클릭
3. `supabase/migrations/setup_posts_storage.sql` 파일을 열어 전체 내용을 복사
4. SQL Editor에 붙여넣기
5. **Run** 버튼 클릭하여 실행
6. 성공 메시지 확인

### 2.2 버킷 생성 확인

1. Supabase Dashboard → **Storage**
2. 다음 버킷들이 생성되었는지 확인:
   - `uploads` - 사용자 파일용 (기존)
   - `posts` - 게시물 이미지용 (새로 생성)

### 2.3 posts 버킷 설정 확인

`posts` 버킷을 클릭하여 다음 설정이 올바른지 확인:

- **Public bucket**: ✅ 활성화 (공개 읽기)
- **File size limit**: 5MB (5,242,880 bytes)
- **Allowed MIME types**: 
  - `image/jpeg`
  - `image/png`
  - `image/webp`

### 2.4 Storage 정책 확인

1. Supabase Dashboard → **Storage** → **Policies**
2. `posts` 버킷에 다음 정책들이 생성되었는지 확인:
   - **Public can view posts** (SELECT, anon)
   - **Authenticated users can view posts** (SELECT, authenticated)
   - **Authenticated users can upload posts** (INSERT, authenticated)
   - **Users can delete own posts** (DELETE, authenticated)
   - **Users can update own posts** (UPDATE, authenticated)

## 3. 문제 해결

### 마이그레이션 실행 시 에러 발생

**"relation already exists" 에러:**
- 테이블이 이미 존재하는 경우입니다
- 기존 테이블을 삭제하거나, `CREATE TABLE IF NOT EXISTS` 구문이 포함되어 있는지 확인

**"permission denied" 에러:**
- Supabase 프로젝트의 권한을 확인하세요
- Service Role Key를 사용하여 실행해야 할 수도 있습니다

### 버킷이 생성되지 않음

**"bucket already exists" 에러:**
- 버킷이 이미 존재하는 경우입니다
- Storage → Buckets에서 확인하세요

**정책이 적용되지 않음:**
- Storage → Policies에서 수동으로 정책을 확인하고 필요시 재생성하세요

## 4. 검증 방법

### 데이터베이스 검증

다음 SQL 쿼리를 실행하여 모든 테이블이 생성되었는지 확인:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

예상 결과:
- comments
- follows
- likes
- posts
- users

### Storage 검증

다음 SQL 쿼리를 실행하여 버킷이 생성되었는지 확인:

```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('uploads', 'posts');
```

예상 결과:
- `uploads` 버킷 (public: false)
- `posts` 버킷 (public: true, file_size_limit: 5242880)

## 5. 체크리스트

마이그레이션 적용을 위한 단계별 체크리스트는 [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)를 참고하세요.

## 6. 다음 단계

마이그레이션과 Storage 설정이 완료되면:

1. ✅ Tailwind CSS Instagram 컬러 스키마 설정 완료
2. ✅ TypeScript 타입 정의 완료 (`lib/types.ts`)
3. ✅ 데이터베이스 마이그레이션 적용 (이 가이드 참고)
4. ✅ Storage 버킷 설정 (이 가이드 참고)

이제 **TODO.md**의 "## 2. 레이아웃 구조" 작업을 시작할 수 있습니다.

