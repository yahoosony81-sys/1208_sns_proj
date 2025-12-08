# 데이터베이스 마이그레이션 검증 가이드

이 문서는 `db.sql` 마이그레이션 적용 후 데이터베이스가 올바르게 생성되었는지 확인하는 방법을 안내합니다.

## 📋 검증 항목

다음 항목들이 올바르게 생성되었는지 확인합니다:

### 테이블 (5개)
- ✅ `users` - 사용자 정보
- ✅ `posts` - 게시물
- ✅ `likes` - 좋아요
- ✅ `comments` - 댓글
- ✅ `follows` - 팔로우 관계

### 뷰 (2개)
- ✅ `post_stats` - 게시물 통계 (좋아요 수, 댓글 수)
- ✅ `user_stats` - 사용자 통계 (게시물 수, 팔로워 수, 팔로잉 수)

### 트리거 (2개)
- ✅ `posts` 테이블: `set_updated_at` 트리거
- ✅ `comments` 테이블: `set_updated_at` 트리거

### 트리거 함수 (1개)
- ✅ `handle_updated_at` - updated_at 자동 업데이트 함수

## 🚀 검증 방법

### 방법 1: 자동 검증 스크립트 사용 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New query** 버튼 클릭
5. `supabase/migrations/verify_database.sql` 파일을 열어 전체 내용을 복사
6. SQL Editor에 붙여넣기
7. **Run** 버튼 클릭하여 실행
8. 결과 확인

**예상 결과:**
- 각 검증 항목에 대해 ✅ 또는 ❌ 표시
- 마지막에 요약 보고서 표시
- 모든 항목이 ✅로 표시되면 성공

### 방법 2: Supabase Dashboard에서 수동 확인

#### 2.1 테이블 확인

1. Supabase Dashboard → **Table Editor** 메뉴 클릭
2. 다음 테이블들이 표시되는지 확인:
   - `users`
   - `posts`
   - `likes`
   - `comments`
   - `follows`

3. 각 테이블을 클릭하여 컬럼 확인:

**users 테이블:**
- `id` (UUID, Primary Key)
- `clerk_id` (TEXT, Unique, Not Null)
- `name` (TEXT, Not Null)
- `created_at` (TIMESTAMP WITH TIME ZONE, Not Null)

**posts 테이블:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `image_url` (TEXT, Not Null)
- `caption` (TEXT, Nullable)
- `created_at` (TIMESTAMP WITH TIME ZONE, Not Null)
- `updated_at` (TIMESTAMP WITH TIME ZONE, Not Null)

**likes 테이블:**
- `id` (UUID, Primary Key)
- `post_id` (UUID, Foreign Key → posts.id)
- `user_id` (UUID, Foreign Key → users.id)
- `created_at` (TIMESTAMP WITH TIME ZONE, Not Null)
- Unique constraint: (post_id, user_id)

**comments 테이블:**
- `id` (UUID, Primary Key)
- `post_id` (UUID, Foreign Key → posts.id)
- `user_id` (UUID, Foreign Key → users.id)
- `content` (TEXT, Not Null)
- `created_at` (TIMESTAMP WITH TIME ZONE, Not Null)
- `updated_at` (TIMESTAMP WITH TIME ZONE, Not Null)

**follows 테이블:**
- `id` (UUID, Primary Key)
- `follower_id` (UUID, Foreign Key → users.id)
- `following_id` (UUID, Foreign Key → users.id)
- `created_at` (TIMESTAMP WITH TIME ZONE, Not Null)
- Unique constraint: (follower_id, following_id)
- Check constraint: follower_id != following_id

#### 2.2 뷰 확인

1. Supabase Dashboard → **Database** → **Views** 메뉴 클릭
2. 다음 뷰들이 표시되는지 확인:
   - `post_stats`
   - `user_stats`

3. 각 뷰를 클릭하여 컬럼 확인:

**post_stats 뷰:**
- `post_id` (UUID)
- `user_id` (UUID)
- `image_url` (TEXT)
- `caption` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `likes_count` (BIGINT)
- `comments_count` (BIGINT)

**user_stats 뷰:**
- `user_id` (UUID)
- `clerk_id` (TEXT)
- `name` (TEXT)
- `posts_count` (BIGINT)
- `followers_count` (BIGINT)
- `following_count` (BIGINT)

#### 2.3 트리거 확인

1. Supabase Dashboard → **Database** → **Triggers** 메뉴 클릭
2. 다음 트리거들이 표시되는지 확인:
   - `posts` 테이블: `set_updated_at`
   - `comments` 테이블: `set_updated_at`

3. 각 트리거를 클릭하여 설정 확인:
   - **Event**: UPDATE
   - **Timing**: BEFORE
   - **Function**: `handle_updated_at`

#### 2.4 트리거 함수 확인

1. Supabase Dashboard → **Database** → **Functions** 메뉴 클릭
2. `handle_updated_at` 함수가 표시되는지 확인
3. 함수를 클릭하여 내용 확인:
   - **Return type**: TRIGGER
   - **Language**: plpgsql
   - **Function body**: `NEW.updated_at = now(); RETURN NEW;`

## ✅ 검증 체크리스트

다음 체크리스트를 사용하여 검증을 진행하세요:

### 테이블 검증
- [ ] `users` 테이블 생성 확인
- [ ] `posts` 테이블 생성 확인
- [ ] `likes` 테이블 생성 확인
- [ ] `comments` 테이블 생성 확인
- [ ] `follows` 테이블 생성 확인
- [ ] 각 테이블의 필수 컬럼 확인
- [ ] 외래 키 관계 확인
- [ ] 인덱스 생성 확인

### 뷰 검증
- [ ] `post_stats` 뷰 생성 확인
- [ ] `user_stats` 뷰 생성 확인
- [ ] 각 뷰의 컬럼 확인

### 트리거 검증
- [ ] `posts` 테이블의 `set_updated_at` 트리거 확인
- [ ] `comments` 테이블의 `set_updated_at` 트리거 확인
- [ ] `handle_updated_at` 함수 확인

### 기타 검증
- [ ] RLS 비활성화 확인 (개발 단계)
- [ ] 권한 부여 확인 (anon, authenticated, service_role)

## 🔍 간단한 검증 쿼리

빠르게 확인하고 싶다면 다음 쿼리를 실행하세요:

```sql
-- 테이블 개수 확인 (5개여야 함)
SELECT COUNT(*) as 테이블_개수
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'posts', 'likes', 'comments', 'follows');

-- 뷰 개수 확인 (2개여야 함)
SELECT COUNT(*) as 뷰_개수
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('post_stats', 'user_stats');

-- 트리거 개수 확인 (2개여야 함)
SELECT COUNT(*) as 트리거_개수
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'set_updated_at'
  AND event_object_table IN ('posts', 'comments');
```

**예상 결과:**
- 테이블_개수: `5`
- 뷰_개수: `2`
- 트리거_개수: `2`

## 🐛 문제 해결

### 테이블이 생성되지 않음
- `db.sql` 파일이 올바르게 실행되었는지 확인
- SQL Editor에서 에러 메시지 확인
- `db.sql` 파일을 다시 실행

### 뷰가 생성되지 않음
- 테이블이 먼저 생성되었는지 확인
- `db.sql` 파일의 뷰 생성 부분이 실행되었는지 확인

### 트리거가 생성되지 않음
- `handle_updated_at` 함수가 먼저 생성되었는지 확인
- `db.sql` 파일의 트리거 생성 부분이 실행되었는지 확인

### RLS가 활성화되어 있음
- 개발 단계에서는 RLS가 비활성화되어 있어야 합니다
- `db.sql` 파일에 `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` 구문이 포함되어 있는지 확인

## 📝 참고 사항

### 검증 스크립트 실행 시 주의사항
- 검증 스크립트는 데이터를 변경하지 않습니다 (읽기 전용)
- 여러 번 실행해도 안전합니다
- 결과가 예상과 다르면 `db.sql` 파일을 다시 실행하세요

### 검증 후 다음 단계
모든 검증을 통과했다면:
1. ✅ [Storage 버킷 설정](./STORAGE_BUCKET_SETUP.md) 진행
2. ✅ [TODO.md](./TODO.md)의 "## 2. 레이아웃 구조" 작업 시작

## 🔗 관련 문서

- [setup-migration-guide.md](./setup-migration-guide.md) - 마이그레이션 적용 가이드
- [STORAGE_BUCKET_SETUP.md](./STORAGE_BUCKET_SETUP.md) - Storage 버킷 설정 가이드
- [TODO.md](./TODO.md) - 개발 TODO 리스트
- [PRD.md](./PRD.md) - 프로젝트 요구사항 문서

