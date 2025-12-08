-- ============================================
-- Posts Storage Bucket 설정
-- ============================================
-- 게시물 이미지를 저장하기 위한 Supabase Storage 버킷 생성
-- PRD.md 요구사항: 최대 5MB, 공개 읽기, 이미지 파일만 허용
-- ============================================

-- posts 버킷 생성 (게시물 이미지 저장용)
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

-- 공개 읽기 정책 (anon 사용자도 조회 가능)
CREATE POLICY "Public can view posts"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'posts');

-- 인증된 사용자도 조회 가능
CREATE POLICY "Authenticated users can view posts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'posts');

-- 인증된 사용자만 업로드 가능 (자신의 폴더에만)
CREATE POLICY "Authenticated users can upload posts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

-- 본인만 삭제 가능
CREATE POLICY "Users can delete own posts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

-- 본인만 업데이트 가능
CREATE POLICY "Users can update own posts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
)
WITH CHECK (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

