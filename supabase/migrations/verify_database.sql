-- ============================================
-- 데이터베이스 마이그레이션 검증 스크립트
-- ============================================
-- 이 스크립트는 db.sql 마이그레이션 후
-- 테이블, 뷰, 트리거가 올바르게 생성되었는지 확인합니다.
-- ============================================
-- 
-- 사용 방법:
-- 1. Supabase Dashboard → SQL Editor → New query
-- 2. 이 파일의 전체 내용을 복사하여 붙여넣기
-- 3. Run 버튼 클릭
-- 4. 결과 확인
-- ============================================

-- ============================================
-- 1. 테이블 생성 확인
-- ============================================
-- 다음 5개의 테이블이 생성되었는지 확인합니다:
-- - users, posts, likes, comments, follows
-- ============================================

SELECT 
  '테이블 생성 확인' as 검증_항목,
  table_name as 테이블명,
  CASE 
    WHEN table_name IN ('users', 'posts', 'likes', 'comments', 'follows') 
    THEN '✅ 생성됨' 
    ELSE '❌ 누락됨' 
  END as 상태
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('users', 'posts', 'likes', 'comments', 'follows')
ORDER BY 
  CASE table_name
    WHEN 'users' THEN 1
    WHEN 'posts' THEN 2
    WHEN 'likes' THEN 3
    WHEN 'comments' THEN 4
    WHEN 'follows' THEN 5
  END;

-- ============================================
-- 2. 테이블 컬럼 확인
-- ============================================
-- 각 테이블의 필수 컬럼이 올바르게 생성되었는지 확인합니다.
-- ============================================

-- 2.1 users 테이블 컬럼 확인
SELECT 
  'users 테이블 컬럼' as 검증_항목,
  column_name as 컬럼명,
  data_type as 데이터_타입,
  is_nullable as NULL_허용,
  CASE 
    WHEN column_name IN ('id', 'clerk_id', 'name', 'created_at') 
    THEN '✅ 필수 컬럼' 
    ELSE '⚠️ 추가 컬럼' 
  END as 상태
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 2.2 posts 테이블 컬럼 확인
SELECT 
  'posts 테이블 컬럼' as 검증_항목,
  column_name as 컬럼명,
  data_type as 데이터_타입,
  is_nullable as NULL_허용,
  CASE 
    WHEN column_name IN ('id', 'user_id', 'image_url', 'caption', 'created_at', 'updated_at') 
    THEN '✅ 필수 컬럼' 
    ELSE '⚠️ 추가 컬럼' 
  END as 상태
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'posts'
ORDER BY ordinal_position;

-- 2.3 likes 테이블 컬럼 확인
SELECT 
  'likes 테이블 컬럼' as 검증_항목,
  column_name as 컬럼명,
  data_type as 데이터_타입,
  is_nullable as NULL_허용,
  CASE 
    WHEN column_name IN ('id', 'post_id', 'user_id', 'created_at') 
    THEN '✅ 필수 컬럼' 
    ELSE '⚠️ 추가 컬럼' 
  END as 상태
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'likes'
ORDER BY ordinal_position;

-- 2.4 comments 테이블 컬럼 확인
SELECT 
  'comments 테이블 컬럼' as 검증_항목,
  column_name as 컬럼명,
  data_type as 데이터_타입,
  is_nullable as NULL_허용,
  CASE 
    WHEN column_name IN ('id', 'post_id', 'user_id', 'content', 'created_at', 'updated_at') 
    THEN '✅ 필수 컬럼' 
    ELSE '⚠️ 추가 컬럼' 
  END as 상태
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'comments'
ORDER BY ordinal_position;

-- 2.5 follows 테이블 컬럼 확인
SELECT 
  'follows 테이블 컬럼' as 검증_항목,
  column_name as 컬럼명,
  data_type as 데이터_타입,
  is_nullable as NULL_허용,
  CASE 
    WHEN column_name IN ('id', 'follower_id', 'following_id', 'created_at') 
    THEN '✅ 필수 컬럼' 
    ELSE '⚠️ 추가 컬럼' 
  END as 상태
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'follows'
ORDER BY ordinal_position;

-- ============================================
-- 3. 외래 키(Foreign Keys) 확인
-- ============================================
-- 테이블 간의 관계가 올바르게 설정되었는지 확인합니다.
-- ============================================

SELECT 
  '외래 키 확인' as 검증_항목,
  tc.table_name as 테이블명,
  kcu.column_name as 컬럼명,
  ccu.table_name AS 참조_테이블,
  ccu.column_name AS 참조_컬럼,
  '✅ 외래 키 설정됨' as 상태
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('posts', 'likes', 'comments', 'follows')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 4. 인덱스(Indexes) 확인
-- ============================================
-- 성능 최적화를 위한 인덱스가 생성되었는지 확인합니다.
-- ============================================

SELECT 
  '인덱스 확인' as 검증_항목,
  schemaname as 스키마,
  tablename as 테이블명,
  indexname as 인덱스명,
  indexdef as 인덱스_정의,
  '✅ 인덱스 생성됨' as 상태
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'posts', 'likes', 'comments', 'follows')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================
-- 5. 뷰(Views) 확인
-- ============================================
-- 다음 2개의 뷰가 생성되었는지 확인합니다:
-- - post_stats: 게시물 통계 (좋아요 수, 댓글 수)
-- - user_stats: 사용자 통계 (게시물 수, 팔로워 수, 팔로잉 수)
-- ============================================

SELECT 
  '뷰 생성 확인' as 검증_항목,
  table_name as 뷰명,
  CASE 
    WHEN table_name IN ('post_stats', 'user_stats') 
    THEN '✅ 생성됨' 
    ELSE '❌ 누락됨' 
  END as 상태
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('post_stats', 'user_stats')
ORDER BY table_name;

-- 뷰 컬럼 확인
SELECT 
  '뷰 컬럼 확인' as 검증_항목,
  table_name as 뷰명,
  column_name as 컬럼명,
  data_type as 데이터_타입,
  '✅ 컬럼 존재' as 상태
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('post_stats', 'user_stats')
ORDER BY table_name, ordinal_position;

-- ============================================
-- 6. 트리거(Triggers) 확인
-- ============================================
-- 다음 트리거가 생성되었는지 확인합니다:
-- - posts 테이블: set_updated_at
-- - comments 테이블: set_updated_at
-- ============================================

SELECT 
  '트리거 확인' as 검증_항목,
  trigger_name as 트리거명,
  event_object_table as 테이블명,
  event_manipulation as 이벤트,
  action_timing as 타이밍,
  '✅ 트리거 생성됨' as 상태
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'set_updated_at'
  AND event_object_table IN ('posts', 'comments')
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 7. 트리거 함수 확인
-- ============================================
-- handle_updated_at 함수가 생성되었는지 확인합니다.
-- ============================================

SELECT 
  '트리거 함수 확인' as 검증_항목,
  routine_name as 함수명,
  routine_type as 함수_타입,
  data_type as 반환_타입,
  CASE 
    WHEN routine_name = 'handle_updated_at' 
    THEN '✅ 함수 생성됨' 
    ELSE '❌ 누락됨' 
  END as 상태
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_updated_at';

-- ============================================
-- 8. RLS (Row Level Security) 상태 확인
-- ============================================
-- 개발 단계에서는 RLS가 비활성화되어 있어야 합니다.
-- ============================================

SELECT 
  'RLS 상태 확인' as 검증_항목,
  schemaname as 스키마,
  tablename as 테이블명,
  rowsecurity as RLS_활성화,
  CASE 
    WHEN rowsecurity = false 
    THEN '✅ RLS 비활성화 (개발 단계)' 
    ELSE '⚠️ RLS 활성화됨' 
  END as 상태
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'posts', 'likes', 'comments', 'follows')
ORDER BY tablename;

-- ============================================
-- 9. 권한(Grants) 확인
-- ============================================
-- 테이블에 대한 권한이 올바르게 부여되었는지 확인합니다.
-- ============================================

SELECT 
  '권한 확인' as 검증_항목,
  table_schema as 스키마,
  table_name as 테이블명,
  grantee as 권한_대상,
  privilege_type as 권한_타입,
  '✅ 권한 부여됨' as 상태
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN ('users', 'posts', 'likes', 'comments', 'follows')
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- ============================================
-- 10. 요약 보고서
-- ============================================
-- 전체 검증 결과를 요약합니다.
-- ============================================

SELECT 
  '=== 검증 요약 ===' as 검증_항목,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('users', 'posts', 'likes', 'comments', 'follows')) || ' / 5 테이블 생성됨' as 테이블_상태,
  (SELECT COUNT(*) FROM information_schema.views 
   WHERE table_schema = 'public' 
   AND table_name IN ('post_stats', 'user_stats')) || ' / 2 뷰 생성됨' as 뷰_상태,
  (SELECT COUNT(*) FROM information_schema.triggers 
   WHERE trigger_schema = 'public' 
   AND trigger_name = 'set_updated_at' 
   AND event_object_table IN ('posts', 'comments')) || ' / 2 트리거 생성됨' as 트리거_상태,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('users', 'posts', 'likes', 'comments', 'follows')) = 5
     AND (SELECT COUNT(*) FROM information_schema.views 
          WHERE table_schema = 'public' 
          AND table_name IN ('post_stats', 'user_stats')) = 2
     AND (SELECT COUNT(*) FROM information_schema.triggers 
          WHERE trigger_schema = 'public' 
          AND trigger_name = 'set_updated_at' 
          AND event_object_table IN ('posts', 'comments')) = 2
    THEN '✅ 모든 검증 통과'
    ELSE '❌ 일부 항목 누락'
  END as 최종_상태;

