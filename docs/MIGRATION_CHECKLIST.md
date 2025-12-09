# Supabase 마이그레이션 체크리스트

이 체크리스트를 따라 Supabase Dashboard에서 마이그레이션을 적용하세요.

## ✅ 1단계: 데이터베이스 마이그레이션 적용

### 1.1 db.sql 파일 적용

- [ ] Supabase Dashboard에 로그인
- [ ] 프로젝트 선택
- [ ] SQL Editor 메뉴 클릭
- [ ] New query 버튼 클릭
- [ ] `supabase/migrations/db.sql` 파일 열기
- [ ] 전체 내용 복사
- [ ] SQL Editor에 붙여넣기
- [ ] Run 버튼 클릭
- [ ] 성공 메시지 확인

### 1.2 테이블 생성 확인

- [ ] Table Editor 메뉴 클릭
- [ ] `users` 테이블 확인 (컬럼: id, clerk_id, name, created_at)
- [ ] `posts` 테이블 확인 (컬럼: id, user_id, image_url, caption, created_at, updated_at)
- [ ] `likes` 테이블 확인 (컬럼: id, post_id, user_id, created_at)
- [ ] `comments` 테이블 확인 (컬럼: id, post_id, user_id, content, created_at, updated_at)
- [ ] `follows` 테이블 확인 (컬럼: id, follower_id, following_id, created_at)

### 1.3 뷰 확인

- [ ] Database → Views 메뉴 클릭
- [ ] `post_stats` 뷰 확인
- [ ] `user_stats` 뷰 확인

### 1.4 트리거 확인

- [ ] Database → Triggers 메뉴 클릭
- [ ] `set_updated_at` 트리거가 `posts` 테이블에 적용되었는지 확인
- [ ] `set_updated_at` 트리거가 `comments` 테이블에 적용되었는지 확인

## ✅ 2단계: Storage 버킷 설정

### 2.1 setup_posts_storage.sql 파일 적용

- [ ] SQL Editor 메뉴 클릭
- [ ] New query 버튼 클릭
- [ ] `supabase/migrations/setup_posts_storage.sql` 파일 열기
- [ ] 전체 내용 복사
- [ ] SQL Editor에 붙여넣기
- [ ] Run 버튼 클릭
- [ ] 성공 메시지 확인

### 2.2 버킷 생성 확인

- [ ] Storage 메뉴 클릭
- [ ] `posts` 버킷이 생성되었는지 확인
- [ ] `posts` 버킷 클릭하여 설정 확인:
  - [ ] Public bucket: ✅ 활성화
  - [ ] File size limit: 5MB (5,242,880 bytes)
  - [ ] Allowed MIME types: image/jpeg, image/png, image/webp

### 2.3 Storage 정책 확인

- [ ] Storage → Policies 메뉴 클릭
- [ ] `posts` 버킷에 다음 정책들이 있는지 확인:
  - [ ] "Public can view posts" (SELECT, anon)
  - [ ] "Authenticated users can view posts" (SELECT, authenticated)
  - [ ] "Authenticated users can upload posts" (INSERT, authenticated)
  - [ ] "Users can delete own posts" (DELETE, authenticated)
  - [ ] "Users can update own posts" (UPDATE, authenticated)

## ✅ 3단계: 최종 검증

### 3.1 데이터베이스 검증 SQL 실행

SQL Editor에서 다음 쿼리를 실행하여 모든 테이블이 생성되었는지 확인:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

예상 결과: comments, follows, likes, posts, users

### 3.2 Storage 검증 SQL 실행

SQL Editor에서 다음 쿼리를 실행하여 버킷이 생성되었는지 확인:

```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('uploads', 'posts');
```

예상 결과:
- `uploads` 버킷 (public: false)
- `posts` 버킷 (public: true, file_size_limit: 5242880)

## 완료!

모든 체크리스트를 완료했다면 기본 세팅이 완료된 것입니다.

다음 단계: [TODO.md](../docs/TODO.md)의 "## 2. 레이아웃 구조" 작업을 시작하세요.


