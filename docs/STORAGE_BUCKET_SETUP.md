# Posts Storage 버킷 설정 가이드

이 문서는 `posts` Storage 버킷 생성과 업로드 정책 설정 방법을 안내합니다.

## 📋 개요

`posts` 버킷은 게시물 이미지를 저장하기 위한 Supabase Storage 버킷입니다.

### 버킷 설정
- **이름**: `posts`
- **공개 읽기**: ✅ 활성화 (모든 사용자가 이미지 조회 가능)
- **파일 크기 제한**: 5MB (5,242,880 bytes)
- **허용 MIME 타입**: 
  - `image/jpeg`
  - `image/png`
  - `image/webp`

### 파일 경로 구조
```
posts/
  └── {clerk_user_id}/
      └── {filename}
```

예시: `posts/user_123abc/image.jpg`

## 🚀 설정 방법

### 1단계: SQL 파일 실행

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New query** 버튼 클릭
5. `supabase/migrations/setup_posts_storage.sql` 파일을 열어 전체 내용을 복사
6. SQL Editor에 붙여넣기
7. **Run** 버튼 클릭하여 실행
8. 성공 메시지 확인

### 2단계: 버킷 생성 확인

1. Supabase Dashboard → **Storage** 메뉴 클릭
2. **Buckets** 탭에서 `posts` 버킷이 생성되었는지 확인
3. `posts` 버킷을 클릭하여 다음 설정 확인:
   - ✅ **Public bucket**: 활성화됨
   - ✅ **File size limit**: 5MB (5,242,880 bytes)
   - ✅ **Allowed MIME types**: 
     - `image/jpeg`
     - `image/png`
     - `image/webp`

### 3단계: Storage 정책 확인

1. Supabase Dashboard → **Storage** → **Policies** 메뉴 클릭
2. `posts` 버킷에 다음 정책들이 생성되었는지 확인:

| 정책 이름 | 작업 | 역할 | 설명 |
|---------|------|------|------|
| Public can view posts | SELECT | anon | 모든 사용자가 이미지 조회 가능 |
| Authenticated users can view posts | SELECT | authenticated | 로그인한 사용자가 이미지 조회 가능 |
| Authenticated users can upload posts | INSERT | authenticated | 로그인한 사용자가 자신의 폴더에 업로드 가능 |
| Users can delete own posts | DELETE | authenticated | 사용자가 자신의 이미지만 삭제 가능 |
| Users can update own posts | UPDATE | authenticated | 사용자가 자신의 이미지만 업데이트 가능 |

## ✅ 검증 방법

### SQL 쿼리로 검증

SQL Editor에서 다음 쿼리를 실행하여 버킷이 올바르게 생성되었는지 확인:

```sql
-- 버킷 정보 확인
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types
FROM storage.buckets
WHERE id = 'posts';
```

**예상 결과:**
- `id`: `posts`
- `name`: `posts`
- `public`: `true`
- `file_size_limit`: `5242880`
- `allowed_mime_types`: `{image/jpeg,image/png,image/webp}`

### 정책 목록 확인

```sql
-- 정책 목록 확인
SELECT 
  policyname, 
  cmd, 
  roles
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%posts%'
ORDER BY policyname;
```

**예상 결과:** 5개의 정책이 표시되어야 합니다.

## 🔒 보안 정책 설명

### 1. 공개 읽기 (SELECT - anon)
```sql
CREATE POLICY "Public can view posts"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'posts');
```
- **목적**: 로그인하지 않은 사용자도 게시물 이미지를 조회할 수 있도록 합니다.
- **사용 사례**: 공개 피드에서 이미지 표시

### 2. 인증된 사용자 조회 (SELECT - authenticated)
```sql
CREATE POLICY "Authenticated users can view posts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'posts');
```
- **목적**: 로그인한 사용자가 게시물 이미지를 조회할 수 있도록 합니다.
- **사용 사례**: 인증된 사용자의 피드에서 이미지 표시

### 3. 인증된 사용자 업로드 (INSERT - authenticated)
```sql
CREATE POLICY "Authenticated users can upload posts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
);
```
- **목적**: 로그인한 사용자만 자신의 폴더에 이미지를 업로드할 수 있도록 합니다.
- **제한**: 파일 경로의 첫 번째 폴더가 자신의 Clerk user ID와 일치해야 합니다.
- **사용 사례**: 게시물 작성 시 이미지 업로드

### 4. 본인만 삭제 (DELETE - authenticated)
```sql
CREATE POLICY "Users can delete own posts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
);
```
- **목적**: 사용자가 자신이 업로드한 이미지만 삭제할 수 있도록 합니다.
- **사용 사례**: 게시물 삭제 시 이미지 삭제

### 5. 본인만 업데이트 (UPDATE - authenticated)
```sql
CREATE POLICY "Users can update own posts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
)
WITH CHECK (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
);
```
- **목적**: 사용자가 자신이 업로드한 이미지만 업데이트할 수 있도록 합니다.
- **사용 사례**: 게시물 수정 시 이미지 교체

## 🐛 문제 해결

### "bucket already exists" 에러
- 버킷이 이미 존재하는 경우입니다.
- `ON CONFLICT` 구문이 포함되어 있어 기존 버킷 설정이 업데이트됩니다.
- 에러가 발생하지 않으면 정상입니다.

### "policy already exists" 에러
- SQL 파일에 `DROP POLICY IF EXISTS` 구문이 포함되어 있어 이 에러는 발생하지 않아야 합니다.
- 만약 발생한다면, SQL 파일의 정책 삭제 부분이 실행되지 않은 것입니다.
- 수동으로 기존 정책을 삭제한 후 다시 실행하세요.

### 정책이 적용되지 않음
1. Supabase Dashboard → **Storage** → **Policies**에서 정책 목록 확인
2. `posts` 버킷에 5개의 정책이 있는지 확인
3. 정책이 없다면 SQL 파일을 다시 실행하세요.

### 파일 업로드 실패
1. 파일 크기가 5MB를 초과하지 않는지 확인
2. 파일 형식이 jpeg, png, webp 중 하나인지 확인
3. 파일 경로가 `{clerk_user_id}/{filename}` 형식인지 확인
4. 사용자가 로그인되어 있는지 확인

## 📝 참고 사항

### Clerk 인증 연동
- 이 프로젝트는 Clerk를 인증 시스템으로 사용합니다.
- `auth.jwt()->>'sub'`는 Clerk user ID를 반환합니다.
- 파일 경로의 첫 번째 폴더는 Clerk user ID와 일치해야 합니다.

### 파일 경로 예시
```
posts/user_2abc123def/image.jpg        ✅ 올바른 경로
posts/user_2abc123def/photo.png        ✅ 올바른 경로
posts/other_user/image.jpg             ❌ 다른 사용자 폴더 (업로드 불가)
posts/image.jpg                        ❌ 폴더 없음 (업로드 불가)
```

## 🔗 관련 문서

- [setup-migration-guide.md](./setup-migration-guide.md) - 전체 마이그레이션 가이드
- [TODO.md](./TODO.md) - 개발 TODO 리스트
- [PRD.md](./PRD.md) - 프로젝트 요구사항 문서

