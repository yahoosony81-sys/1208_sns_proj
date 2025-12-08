-- ============================================
-- Posts Storage Bucket 설정
-- ============================================
-- 게시물 이미지를 저장하기 위한 Supabase Storage 버킷 생성
-- PRD.md 요구사항: 최대 5MB, 공개 읽기, 이미지 파일만 허용
-- ============================================
-- 
-- 사용 방법:
-- 1. Supabase Dashboard → SQL Editor → New query
-- 2. 이 파일의 전체 내용을 복사하여 붙여넣기
-- 3. Run 버튼 클릭
-- 4. 성공 메시지 확인
-- ============================================

-- ============================================
-- 1. posts 버킷 생성 (게시물 이미지 저장용)
-- ============================================
-- 버킷 설정:
-- - 공개 읽기: true (누구나 이미지 조회 가능)
-- - 파일 크기 제한: 5MB (5,242,880 bytes)
-- - 허용 MIME 타입: image/jpeg, image/png, image/webp
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,  -- 공개 읽기 (게시물 이미지는 공개)
  5242880,  -- 5MB 제한 (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp']  -- 이미지 파일만 허용
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ============================================
-- 2. 기존 정책 삭제 (중복 방지)
-- ============================================
-- 정책을 재생성하기 전에 기존 정책을 삭제합니다.
-- 이렇게 하면 여러 번 실행해도 에러가 발생하지 않습니다.
-- ============================================
DROP POLICY IF EXISTS "Public can view posts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view posts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own posts" ON storage.objects;

-- ============================================
-- 3. Storage 정책 생성
-- ============================================

-- 3.1 공개 읽기 정책 (anon 사용자도 조회 가능)
-- 모든 사용자(로그인하지 않은 사용자 포함)가 posts 버킷의 이미지를 조회할 수 있습니다.
CREATE POLICY "Public can view posts"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'posts');

-- 3.2 인증된 사용자 조회 정책
-- 로그인한 사용자도 posts 버킷의 이미지를 조회할 수 있습니다.
CREATE POLICY "Authenticated users can view posts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'posts');

-- 3.3 인증된 사용자 업로드 정책
-- 로그인한 사용자만 자신의 폴더에 이미지를 업로드할 수 있습니다.
-- 파일 경로: {clerk_user_id}/{filename}
-- 예: user_123abc/image.jpg
CREATE POLICY "Authenticated users can upload posts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
);

-- 3.4 본인만 삭제 가능 정책
-- 사용자는 자신이 업로드한 이미지만 삭제할 수 있습니다.
CREATE POLICY "Users can delete own posts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (auth.jwt()->>'sub')
);

-- 3.5 본인만 업데이트 가능 정책
-- 사용자는 자신이 업로드한 이미지만 업데이트할 수 있습니다.
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

-- ============================================
-- 4. 검증 쿼리 (선택사항)
-- ============================================
-- 아래 쿼리를 실행하여 버킷과 정책이 올바르게 생성되었는지 확인할 수 있습니다.
-- ============================================

-- 버킷 정보 확인
-- SELECT id, name, public, file_size_limit, allowed_mime_types
-- FROM storage.buckets
-- WHERE id = 'posts';

-- 정책 목록 확인
-- SELECT policyname, cmd, roles
-- FROM pg_policies
-- WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%posts%';

