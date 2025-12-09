-- ============================================
-- 프로필 이미지 URL 컬럼 추가 마이그레이션
-- ============================================
-- users 테이블에 profile_image_url 컬럼을 추가합니다.
-- 프로필 이미지는 Supabase Storage의 posts 버킷에 저장됩니다.
-- ============================================

-- users 테이블에 profile_image_url 컬럼 추가
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- 컬럼 코멘트 추가
COMMENT ON COLUMN public.users.profile_image_url IS '프로필 이미지 URL (Supabase Storage)';

