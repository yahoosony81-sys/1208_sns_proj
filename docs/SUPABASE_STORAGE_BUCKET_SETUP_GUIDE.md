# Supabase Storage 버킷 생성 가이드

이 문서는 Supabase Dashboard에서 `posts` Storage 버킷을 생성하는 방법을 단계별로 안내합니다.

## 📋 사전 준비

- Supabase 프로젝트가 생성되어 있어야 합니다
- Supabase Dashboard에 로그인할 수 있어야 합니다

## 🚀 방법 1: SQL Editor를 사용한 자동 생성 (권장)

이 방법은 SQL 파일을 실행하여 버킷과 정책을 한 번에 생성합니다.

### 1단계: SQL 파일 열기

1. 프로젝트 폴더에서 `supabase/migrations/setup_posts_storage.sql` 파일을 엽니다
2. 파일의 전체 내용을 복사합니다 (Ctrl+A → Ctrl+C)

### 2단계: Supabase Dashboard 접속

1. 웹 브라우저에서 [Supabase Dashboard](https://supabase.com/dashboard)에 접속합니다
2. 로그인합니다
3. 프로젝트를 선택합니다

### 3단계: SQL Editor 열기

1. 좌측 사이드바에서 **SQL Editor** 메뉴를 클릭합니다
   - 위치: 좌측 메뉴에서 "SQL Editor" 또는 "SQL" 아이콘
2. **New query** 버튼을 클릭합니다
   - 또는 기존 쿼리 탭이 있다면 새 탭을 엽니다

### 4단계: SQL 실행

1. SQL Editor 텍스트 영역에 복사한 SQL 내용을 붙여넣습니다 (Ctrl+V)
2. 우측 상단의 **Run** 버튼을 클릭합니다
   - 또는 `Ctrl+Enter` 단축키를 사용할 수 있습니다
3. 실행 결과를 확인합니다:
   - 성공: "Success. No rows returned" 또는 "Success" 메시지 표시
   - 실패: 에러 메시지가 표시됩니다 (아래 문제 해결 섹션 참고)

### 5단계: 버킷 생성 확인

1. 좌측 사이드바에서 **Storage** 메뉴를 클릭합니다
2. **Buckets** 탭이 선택되어 있는지 확인합니다
3. 버킷 목록에서 `posts` 버킷이 표시되는지 확인합니다
4. `posts` 버킷을 클릭하여 상세 정보를 확인합니다:
   - **Name**: `posts`
   - **Public bucket**: ✅ 체크되어 있어야 합니다
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

### 6단계: Storage 정책 확인

1. **Storage** 메뉴에서 **Policies** 탭을 클릭합니다
2. `posts` 버킷을 선택합니다 (드롭다운 또는 필터 사용)
3. 다음 5개의 정책이 생성되었는지 확인합니다:

| 정책 이름 | 작업 | 역할 | 설명 |
|---------|------|------|------|
| Public can view posts | SELECT | anon | 모든 사용자가 이미지 조회 가능 |
| Authenticated users can view posts | SELECT | authenticated | 로그인한 사용자가 이미지 조회 가능 |
| Authenticated users can upload posts | INSERT | authenticated | 로그인한 사용자가 자신의 폴더에 업로드 가능 |
| Users can delete own posts | DELETE | authenticated | 사용자가 자신의 이미지만 삭제 가능 |
| Users can update own posts | UPDATE | authenticated | 사용자가 자신의 이미지만 업데이트 가능 |

---

## 🔧 방법 2: Dashboard UI를 사용한 수동 생성

SQL Editor를 사용하지 않고 Dashboard UI로 직접 생성하는 방법입니다.

### 1단계: Storage 메뉴 접속

1. Supabase Dashboard에 로그인합니다
2. 프로젝트를 선택합니다
3. 좌측 사이드바에서 **Storage** 메뉴를 클릭합니다

### 2단계: 새 버킷 생성

1. **Buckets** 탭이 선택되어 있는지 확인합니다
2. **New bucket** 버튼을 클릭합니다
3. 버킷 정보를 입력합니다:
   - **Name**: `posts` (정확히 입력)
   - **Public bucket**: ✅ 체크 (공개 읽기 활성화)
   - **File size limit**: `5242880` (5MB, 5 * 1024 * 1024)
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/png`
     - `image/webp`
     - (각각 한 줄씩 입력하거나 쉼표로 구분)
4. **Create bucket** 버튼을 클릭합니다

### 3단계: Storage 정책 설정

**중요**: UI로 버킷을 생성한 경우, 정책은 SQL Editor를 통해 설정해야 합니다.

1. **SQL Editor** 메뉴로 이동합니다
2. 다음 SQL을 실행합니다 (정책 부분만):

```sql
-- 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "Public can view posts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view posts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own posts" ON storage.objects;

-- 공개 읽기 정책
CREATE POLICY "Public can view posts"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'posts');

-- 인증된 사용자 조회 정책
CREATE POLICY "Authenticated users can view posts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'posts');

-- 인증된 사용자 업로드 정책
CREATE POLICY "Authenticated users can upload posts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
);

-- 본인만 삭제 가능 정책
CREATE POLICY "Users can delete own posts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
);

-- 본인만 업데이트 가능 정책
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

3. **Run** 버튼을 클릭하여 실행합니다

---

## ✅ 검증 방법

### 방법 1: Dashboard에서 확인

1. **Storage** → **Buckets**에서 `posts` 버킷이 표시되는지 확인
2. **Storage** → **Policies**에서 5개의 정책이 생성되었는지 확인

### 방법 2: SQL 쿼리로 확인

SQL Editor에서 다음 쿼리를 실행합니다:

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

---

## 🐛 문제 해결

### 문제 1: "bucket already exists" 에러

**원인**: 버킷이 이미 존재합니다.

**해결 방법**:
- SQL 파일에 `ON CONFLICT` 구문이 포함되어 있어 에러 없이 기존 버킷이 업데이트됩니다
- 에러가 발생하지 않으면 정상입니다
- 만약 에러가 발생한다면, 기존 버킷을 삭제한 후 다시 실행하세요:
  1. Storage → Buckets → `posts` 버킷 선택
  2. **Delete bucket** 버튼 클릭
  3. SQL 파일 다시 실행

### 문제 2: "policy already exists" 에러

**원인**: 정책이 이미 존재합니다.

**해결 방법**:
- SQL 파일에 `DROP POLICY IF EXISTS` 구문이 포함되어 있어 이 에러는 발생하지 않아야 합니다
- 만약 발생한다면, SQL 파일의 정책 삭제 부분이 실행되지 않은 것입니다
- 수동으로 기존 정책을 삭제한 후 다시 실행하세요:
  1. Storage → Policies → `posts` 버킷 선택
  2. 각 정책 옆의 **Delete** 버튼 클릭
  3. SQL 파일 다시 실행

### 문제 3: 정책이 적용되지 않음

**증상**: 버킷은 생성되었지만 정책이 없습니다.

**해결 방법**:
1. Storage → Policies에서 정책 목록 확인
2. `posts` 버킷에 5개의 정책이 있는지 확인
3. 정책이 없다면 SQL 파일의 정책 부분만 다시 실행

### 문제 4: 파일 업로드 실패

**확인 사항**:
1. ✅ 파일 크기가 5MB를 초과하지 않는지 확인
2. ✅ 파일 형식이 jpeg, png, webp 중 하나인지 확인
3. ✅ 파일 경로가 `{clerk_user_id}/{filename}` 형식인지 확인
4. ✅ 사용자가 로그인되어 있는지 확인
5. ✅ Storage 정책이 올바르게 설정되었는지 확인

---

## 📝 참고 사항

### 파일 경로 구조

```
posts/
  └── {clerk_user_id}/
      └── {filename}
```

**예시:**
- ✅ `posts/user_2abc123def/image.jpg` (올바른 경로)
- ✅ `posts/user_2abc123def/photo.png` (올바른 경로)
- ❌ `posts/other_user/image.jpg` (다른 사용자 폴더, 업로드 불가)
- ❌ `posts/image.jpg` (폴더 없음, 업로드 불가)

### Clerk 인증 연동

- 이 프로젝트는 Clerk를 인증 시스템으로 사용합니다
- `auth.jwt()->>'sub'`는 Clerk user ID를 반환합니다
- 파일 경로의 첫 번째 폴더는 Clerk user ID와 일치해야 합니다

### 버킷 설정 요약

| 항목 | 값 |
|------|-----|
| 이름 | `posts` |
| 공개 읽기 | ✅ 활성화 |
| 파일 크기 제한 | 5MB (5,242,880 bytes) |
| 허용 MIME 타입 | image/jpeg, image/png, image/webp |

---

## 🔗 관련 문서

- [STORAGE_BUCKET_SETUP.md](./STORAGE_BUCKET_SETUP.md) - 상세한 정책 설명
- [setup-migration-guide.md](./setup-migration-guide.md) - 전체 마이그레이션 가이드
- [TODO.md](./TODO.md) - 개발 TODO 리스트

---

## ✅ 완료 체크리스트

버킷 생성이 완료되었는지 확인하세요:

- [ ] `posts` 버킷이 Storage → Buckets에 표시됨
- [ ] 버킷이 Public으로 설정됨
- [ ] 파일 크기 제한이 5MB로 설정됨
- [ ] 허용 MIME 타입이 image/jpeg, image/png, image/webp로 설정됨
- [ ] Storage → Policies에 5개의 정책이 생성됨
- [ ] SQL 쿼리로 버킷 정보 확인 완료
- [ ] SQL 쿼리로 정책 목록 확인 완료

모든 항목이 체크되면 버킷 생성이 완료된 것입니다! 🎉

