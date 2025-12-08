# 데이터베이스 마이그레이션 적용 가이드

이 문서는 `db.sql` 파일을 Supabase에 적용하고 검증하는 전체 과정을 단계별로 안내합니다.

## 📋 개요

이 가이드는 다음 작업을 포함합니다:
1. `db.sql` 파일을 Supabase Dashboard에 적용
2. 검증 스크립트를 사용하여 테이블, 뷰, 트리거 확인
3. 문제 발생 시 해결 방법

## 🚀 단계별 적용 가이드

### 1단계: 사전 준비

#### 1.1 필요한 파일 확인

다음 파일들이 준비되어 있는지 확인하세요:

- ✅ `supabase/migrations/db.sql` - 데이터베이스 마이그레이션 파일
- ✅ `supabase/migrations/verify_database.sql` - 검증 스크립트

#### 1.2 Supabase 프로젝트 접근

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 프로젝트 설정에서 다음 정보 확인:
   - 프로젝트 URL
   - API Keys (anon key, service role key)

### 2단계: 마이그레이션 적용

#### 2.1 SQL Editor 열기

1. Supabase Dashboard 좌측 메뉴에서 **SQL Editor** 클릭
2. **New query** 버튼 클릭
3. 새 쿼리 탭이 열립니다

#### 2.2 db.sql 파일 내용 복사

1. 프로젝트의 `supabase/migrations/db.sql` 파일을 엽니다
2. **전체 내용을 복사**합니다 (Ctrl+A → Ctrl+C 또는 Cmd+A → Cmd+C)
3. 파일 내용 확인:
   - Users 테이블 생성
   - Posts, Likes, Comments, Follows 테이블 생성
   - Views 생성 (post_stats, user_stats)
   - Triggers 생성 (set_updated_at)

#### 2.3 SQL Editor에 붙여넣기

1. Supabase Dashboard의 SQL Editor에 붙여넣기 (Ctrl+V 또는 Cmd+V)
2. SQL 문이 올바르게 표시되는지 확인

#### 2.4 마이그레이션 실행

1. SQL Editor 하단의 **Run** 버튼 클릭
2. 또는 **Ctrl+Enter** (Windows/Linux) 또는 **Cmd+Enter** (Mac) 단축키 사용

#### 2.5 실행 결과 확인

**성공 시:**
- 메시지: `Success. No rows returned` 또는 `Success`
- 실행 시간 표시
- 에러 메시지 없음

**실패 시:**
- 에러 메시지가 표시됩니다
- [문제 해결](#문제-해결) 섹션 참고

### 3단계: 자동 검증 (권장)

#### 3.1 검증 스크립트 실행

1. SQL Editor에서 **New query** 버튼 클릭 (새 쿼리 탭)
2. `supabase/migrations/verify_database.sql` 파일을 열어 전체 내용을 복사
3. SQL Editor에 붙여넣기
4. **Run** 버튼 클릭

#### 3.2 검증 결과 확인

검증 스크립트는 다음 항목들을 자동으로 확인합니다:

**테이블 검증:**
- ✅ `users` 테이블 생성 확인
- ✅ `posts` 테이블 생성 확인
- ✅ `likes` 테이블 생성 확인
- ✅ `comments` 테이블 생성 확인
- ✅ `follows` 테이블 생성 확인

**뷰 검증:**
- ✅ `post_stats` 뷰 생성 확인
- ✅ `user_stats` 뷰 생성 확인

**트리거 검증:**
- ✅ `posts` 테이블의 `set_updated_at` 트리거 확인
- ✅ `comments` 테이블의 `set_updated_at` 트리거 확인
- ✅ `handle_updated_at` 함수 확인

**기타 검증:**
- ✅ 외래 키 관계 확인
- ✅ 인덱스 생성 확인
- ✅ RLS 상태 확인 (개발 단계에서는 비활성화)
- ✅ 권한 부여 확인

**최종 요약:**
- 마지막 쿼리 결과에서 전체 검증 상태 확인
- 모든 항목이 ✅로 표시되면 성공

### 4단계: 수동 확인 (선택사항)

검증 스크립트 외에도 Supabase Dashboard에서 직접 확인할 수 있습니다.

#### 4.1 테이블 확인

1. Supabase Dashboard → **Table Editor** 메뉴 클릭
2. 다음 테이블들이 표시되는지 확인:
   - `users`
   - `posts`
   - `likes`
   - `comments`
   - `follows`

#### 4.2 뷰 확인

1. Supabase Dashboard → **Database** → **Views** 메뉴 클릭
2. 다음 뷰들이 표시되는지 확인:
   - `post_stats`
   - `user_stats`

#### 4.3 트리거 확인

1. Supabase Dashboard → **Database** → **Triggers** 메뉴 클릭
2. 다음 트리거들이 표시되는지 확인:
   - `posts` 테이블: `set_updated_at`
   - `comments` 테이블: `set_updated_at`

## ✅ 검증 체크리스트

다음 체크리스트를 사용하여 검증을 진행하세요:

### 마이그레이션 적용
- [ ] `db.sql` 파일 내용을 Supabase SQL Editor에 붙여넣기
- [ ] 마이그레이션 실행 성공 확인
- [ ] 에러 메시지 없음 확인

### 자동 검증
- [ ] `verify_database.sql` 스크립트 실행
- [ ] 모든 테이블 생성 확인 (5개)
- [ ] 모든 뷰 생성 확인 (2개)
- [ ] 모든 트리거 생성 확인 (2개)
- [ ] 최종 요약에서 "✅ 모든 검증 통과" 확인

### 수동 확인 (선택사항)
- [ ] Table Editor에서 테이블 목록 확인
- [ ] Database → Views에서 뷰 목록 확인
- [ ] Database → Triggers에서 트리거 목록 확인

## 🐛 문제 해결

### 문제 1: "relation already exists" 에러

**원인:** 테이블이 이미 존재하는 경우

**해결 방법:**
1. `db.sql` 파일에 `CREATE TABLE IF NOT EXISTS` 구문이 포함되어 있는지 확인
2. 이미 포함되어 있다면 에러를 무시해도 됩니다 (테이블이 이미 존재하므로)
3. 테이블을 새로 만들고 싶다면:
   ```sql
   -- 기존 테이블 삭제 (주의: 데이터가 모두 삭제됩니다)
   DROP TABLE IF EXISTS public.follows CASCADE;
   DROP TABLE IF EXISTS public.comments CASCADE;
   DROP TABLE IF EXISTS public.likes CASCADE;
   DROP TABLE IF EXISTS public.posts CASCADE;
   DROP TABLE IF EXISTS public.users CASCADE;
   ```
   그 후 `db.sql`을 다시 실행

### 문제 2: "permission denied" 에러

**원인:** 권한이 부족한 경우

**해결 방법:**
1. Supabase 프로젝트의 소유자인지 확인
2. Service Role Key를 사용하여 실행 (SQL Editor에서 자동으로 적용됨)
3. 프로젝트 설정에서 권한 확인

### 문제 3: "function already exists" 에러

**원인:** `handle_updated_at` 함수가 이미 존재하는 경우

**해결 방법:**
1. `db.sql` 파일에 `CREATE OR REPLACE FUNCTION` 구문이 포함되어 있는지 확인
2. 이미 포함되어 있다면 에러를 무시해도 됩니다
3. 함수를 새로 만들고 싶다면:
   ```sql
   DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
   ```
   그 후 `db.sql`을 다시 실행

### 문제 4: "trigger already exists" 에러

**원인:** 트리거가 이미 존재하는 경우

**해결 방법:**
1. 기존 트리거를 삭제:
   ```sql
   DROP TRIGGER IF EXISTS set_updated_at ON public.posts;
   DROP TRIGGER IF EXISTS set_updated_at ON public.comments;
   ```
2. `db.sql`을 다시 실행

### 문제 5: 검증 스크립트에서 일부 항목이 누락됨

**원인:** 마이그레이션이 부분적으로만 실행된 경우

**해결 방법:**
1. 에러 메시지 확인
2. 해당 부분만 수동으로 실행
3. 또는 전체 `db.sql`을 다시 실행 (이미 존재하는 항목은 무시됨)

### 문제 6: 외래 키 제약 조건 에러

**원인:** 테이블 생성 순서 문제

**해결 방법:**
1. `db.sql` 파일의 테이블 생성 순서 확인:
   - `users` → `posts` → `likes`, `comments` → `follows`
2. 순서대로 실행되었는지 확인
3. 필요시 테이블을 삭제하고 다시 실행

## 📝 빠른 참조

### 마이그레이션 적용 명령어 (수동)

1. Supabase Dashboard → SQL Editor → New query
2. `db.sql` 파일 내용 복사 → 붙여넣기
3. Run 클릭

### 검증 명령어 (수동)

1. Supabase Dashboard → SQL Editor → New query
2. `verify_database.sql` 파일 내용 복사 → 붙여넣기
3. Run 클릭
4. 결과 확인

### 간단한 검증 쿼리

빠르게 확인하고 싶다면:

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

## 🔗 관련 문서

- [VERIFY_DATABASE.md](./VERIFY_DATABASE.md) - 상세 검증 가이드
- [setup-migration-guide.md](./setup-migration-guide.md) - 전체 마이그레이션 가이드
- [TODO.md](./TODO.md) - 개발 TODO 리스트
- [PRD.md](./PRD.md) - 프로젝트 요구사항 문서

## 🎯 다음 단계

마이그레이션 적용과 검증이 완료되면:

1. ✅ [Storage 버킷 설정](./STORAGE_BUCKET_SETUP.md) 진행
2. ✅ [TODO.md](./TODO.md)의 "## 2. 레이아웃 구조" 작업 시작

