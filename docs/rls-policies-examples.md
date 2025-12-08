# Row Level Security (RLS) 정책 예시

이 문서는 Clerk와 Supabase를 통합할 때 사용할 수 있는 RLS 정책 예시를 제공합니다.

## 기본 개념

Clerk의 사용자 ID는 JWT 토큰의 `sub` (subject) 클레임에 포함되어 있습니다. Supabase에서는 `auth.jwt()->>'sub'` 함수를 사용하여 이 값을 가져올 수 있습니다.

## 기본 패턴

### 1. 사용자별 데이터 접근 제어

가장 일반적인 패턴으로, 사용자가 자신의 데이터만 접근할 수 있도록 제한합니다.

```sql
-- 테이블 생성
CREATE TABLE user_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE user_posts ENABLE ROW LEVEL SECURITY;

-- SELECT: 자신의 게시물만 조회
CREATE POLICY "Users can view their own posts"
ON user_posts
FOR SELECT
TO authenticated
USING (auth.jwt()->>'sub' = user_id);

-- INSERT: 자신의 게시물만 생성
CREATE POLICY "Users can insert their own posts"
ON user_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'sub' = user_id);

-- UPDATE: 자신의 게시물만 수정
CREATE POLICY "Users can update their own posts"
ON user_posts
FOR UPDATE
TO authenticated
USING (auth.jwt()->>'sub' = user_id)
WITH CHECK (auth.jwt()->>'sub' = user_id);

-- DELETE: 자신의 게시물만 삭제
CREATE POLICY "Users can delete their own posts"
ON user_posts
FOR DELETE
TO authenticated
USING (auth.jwt()->>'sub' = user_id);
```

### 2. 공개 데이터 + 사용자별 데이터

일부 데이터는 공개하고, 일부는 사용자별로 제한하는 패턴입니다.

```sql
-- 테이블 생성
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  title TEXT NOT NULL,
  content TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- SELECT: 공개 게시물 또는 자신의 게시물만 조회
CREATE POLICY "Users can view public or their own posts"
ON posts
FOR SELECT
TO authenticated
USING (
  is_public = true 
  OR auth.jwt()->>'sub' = user_id
);

-- 익명 사용자도 공개 게시물 조회 가능
CREATE POLICY "Anonymous can view public posts"
ON posts
FOR SELECT
TO anon
USING (is_public = true);

-- INSERT, UPDATE, DELETE는 자신의 게시물만
CREATE POLICY "Users can insert their own posts"
ON posts
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can update their own posts"
ON posts
FOR UPDATE
TO authenticated
USING (auth.jwt()->>'sub' = user_id)
WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can delete their own posts"
ON posts
FOR DELETE
TO authenticated
USING (auth.jwt()->>'sub' = user_id);
```

### 3. 관계형 데이터 접근 제어

다른 테이블과의 관계를 고려한 접근 제어입니다.

```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 프로젝트 테이블
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL REFERENCES users(clerk_id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 프로젝트 멤버 테이블
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(clerk_id),
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- RLS 활성화
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- 프로젝트: 소유자 또는 멤버만 조회 가능
CREATE POLICY "Users can view projects they own or are members of"
ON projects
FOR SELECT
TO authenticated
USING (
  owner_id = auth.jwt()->>'sub'
  OR EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = projects.id
    AND project_members.user_id = auth.jwt()->>'sub'
  )
);

-- 프로젝트: 소유자만 생성 가능
CREATE POLICY "Users can create projects"
ON projects
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.jwt()->>'sub');

-- 프로젝트: 소유자만 수정/삭제 가능
CREATE POLICY "Owners can update their projects"
ON projects
FOR UPDATE
TO authenticated
USING (owner_id = auth.jwt()->>'sub')
WITH CHECK (owner_id = auth.jwt()->>'sub');

CREATE POLICY "Owners can delete their projects"
ON projects
FOR DELETE
TO authenticated
USING (owner_id = auth.jwt()->>'sub');

-- 프로젝트 멤버: 프로젝트 소유자 또는 멤버만 조회 가능
CREATE POLICY "Users can view members of their projects"
ON project_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_members.project_id
    AND (
      projects.owner_id = auth.jwt()->>'sub'
      OR EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = projects.id
        AND pm.user_id = auth.jwt()->>'sub'
      )
    )
  )
);

-- 프로젝트 멤버: 소유자만 추가/삭제 가능
CREATE POLICY "Owners can add members to their projects"
ON project_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_members.project_id
    AND projects.owner_id = auth.jwt()->>'sub'
  )
);

CREATE POLICY "Owners can remove members from their projects"
ON project_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_members.project_id
    AND projects.owner_id = auth.jwt()->>'sub'
  )
);
```

### 4. 관리자 권한 패턴

특정 사용자에게 관리자 권한을 부여하는 패턴입니다.

```sql
-- 사용자 테이블에 역할 추가
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'; -- 'user', 'admin'

-- 게시물 테이블
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- SELECT: 자신의 게시물 또는 관리자는 모든 게시물 조회
CREATE POLICY "Users can view their own posts or admins can view all"
ON posts
FOR SELECT
TO authenticated
USING (
  auth.jwt()->>'sub' = user_id
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.clerk_id = auth.jwt()->>'sub'
    AND users.role = 'admin'
  )
);

-- INSERT: 모든 인증된 사용자 가능
CREATE POLICY "Authenticated users can create posts"
ON posts
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'sub' = user_id);

-- UPDATE: 자신의 게시물 또는 관리자
CREATE POLICY "Users can update their own posts or admins can update any"
ON posts
FOR UPDATE
TO authenticated
USING (
  auth.jwt()->>'sub' = user_id
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.clerk_id = auth.jwt()->>'sub'
    AND users.role = 'admin'
  )
)
WITH CHECK (
  auth.jwt()->>'sub' = user_id
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.clerk_id = auth.jwt()->>'sub'
    AND users.role = 'admin'
  )
);

-- DELETE: 자신의 게시물 또는 관리자
CREATE POLICY "Users can delete their own posts or admins can delete any"
ON posts
FOR DELETE
TO authenticated
USING (
  auth.jwt()->>'sub' = user_id
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.clerk_id = auth.jwt()->>'sub'
    AND users.role = 'admin'
  )
);
```

## 정책 확인 및 디버깅

### 현재 RLS 상태 확인

```sql
-- 테이블의 RLS 활성화 상태 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 정책 목록 확인

```sql
-- 특정 테이블의 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'your_table_name';
```

### JWT 토큰 내용 확인

```sql
-- 현재 JWT의 sub 클레임 확인 (디버깅용)
SELECT auth.jwt()->>'sub' as user_id;
```

## 개발 환경에서 RLS 비활성화

개발 초기 단계에서는 RLS를 비활성화하여 빠르게 개발할 수 있습니다:

```sql
-- 단일 테이블 RLS 비활성화
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;

-- 모든 테이블 RLS 비활성화 (개발 환경 전용)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;
```

> **⚠️ 주의**: 프로덕션 환경에서는 반드시 RLS를 활성화하고 적절한 정책을 설정하세요!

## 모범 사례

1. **항상 RLS 활성화**: 프로덕션 환경에서는 반드시 RLS를 활성화하세요.

2. **명확한 정책 이름**: 정책 이름은 의도를 명확히 표현하세요.
   ```sql
   -- ✅ 좋은 예
   CREATE POLICY "Users can view their own posts"
   
   -- ❌ 나쁜 예
   CREATE POLICY "policy1"
   ```

3. **최소 권한 원칙**: 사용자에게 필요한 최소한의 권한만 부여하세요.

4. **정책 테스트**: 정책을 생성한 후 반드시 테스트하세요.

5. **성능 고려**: 복잡한 정책은 성능에 영향을 줄 수 있으므로, 필요시 인덱스를 추가하세요.
   ```sql
   -- user_id에 인덱스 추가 (RLS 정책에서 자주 사용되는 경우)
   CREATE INDEX idx_posts_user_id ON posts(user_id);
   ```

## 참고 자료

- [Supabase Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS 문서](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

