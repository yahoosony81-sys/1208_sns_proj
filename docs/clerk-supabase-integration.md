# Clerk + Supabase 통합 가이드

이 문서는 2025년 최신 모범 사례를 기반으로 Clerk와 Supabase를 통합하는 방법을 설명합니다.

## 개요

2025년 4월 1일부터 Clerk는 Supabase의 공식 서드파티 인증 제공자로 지원됩니다. 이전에 사용되던 JWT 템플릿 방식은 더 이상 권장되지 않으며, **네이티브 통합 방식**을 사용해야 합니다.

### 네이티브 통합의 장점

- ✅ 각 Supabase 요청마다 새 토큰을 가져올 필요 없음
- ✅ Supabase JWT 시크릿 키를 Clerk와 공유할 필요 없음
- ✅ 더 간단한 설정 및 유지보수
- ✅ 향상된 보안

## 통합 단계

### 1단계: Clerk Dashboard에서 Supabase 통합 활성화

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 로그인
2. 프로젝트 선택
3. **Integrations** 메뉴로 이동
4. **Supabase** 통합 찾기
5. **"Connect with Supabase"** 또는 **"Activate Supabase integration"** 클릭
6. 설정 옵션 선택 후 **"Activate Supabase integration"** 클릭
7. 표시되는 **Clerk domain** 복사 (예: `your-app-12.clerk.accounts.dev`)

> **참고**: Clerk Dashboard에서 Supabase 통합 페이지를 찾을 수 없는 경우, [Clerk의 Supabase 통합 설정 페이지](https://dashboard.clerk.com/setup/supabase)로 직접 이동하세요.

### 2단계: Supabase Dashboard에서 Clerk 인증 제공자 추가

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. **Authentication** → **Sign In / Up** 메뉴로 이동
4. 페이지 하단의 **"Third-Party Auth"** 섹션 찾기
5. **"Add provider"** 클릭
6. 제공자 목록에서 **"Clerk"** 선택
7. 1단계에서 복사한 **Clerk domain** 입력 (예: `your-app-12.clerk.accounts.dev`)
8. **"Save"** 또는 **"Add Provider"** 클릭

> **참고**: Supabase Dashboard에서 Clerk를 찾을 수 없는 경우, Supabase 프로젝트가 최신 버전인지 확인하세요. Clerk 통합은 2025년 4월 이후 버전에서 지원됩니다.

### 3단계: 환경 변수 설정

프로젝트 루트의 `.env` 파일에 다음 환경 변수들이 설정되어 있는지 확인하세요:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# 공식 가이드에서는 PUBLISHABLE_KEY를 사용하지만, ANON_KEY도 지원
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
# 또는
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # 서버 사이드 전용, 절대 공개하지 마세요!
```

### 4단계: 코드에서 Supabase 클라이언트 사용

프로젝트에는 이미 최적화된 Supabase 클라이언트가 준비되어 있습니다:

#### Client Component에서 사용

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';

export default function MyComponent() {
  const supabase = useClerkSupabaseClient();

  async function fetchData() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    return data;
  }

  return <div>...</div>;
}
```

#### Server Component에서 사용

```tsx
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*');
  
  if (error) {
    throw error;
  }
  
  return (
    <div>
      {data?.map((task) => (
        <p key={task.id}>{task.name}</p>
      ))}
    </div>
  );
}
```

#### Server Action에서 사용

```ts
'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';

export async function addTask(name: string) {
  const supabase = createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({ name });
  
  if (error) {
    throw new Error('Failed to add task');
  }
  
  return data;
}
```

## Row Level Security (RLS) 정책 설정

Clerk와 Supabase를 통합할 때는 반드시 RLS 정책을 설정해야 합니다. Clerk의 사용자 ID는 JWT의 `sub` 클레임에 포함되어 있으며, 이를 활용하여 RLS 정책을 작성할 수 있습니다.

### 기본 RLS 정책 예시

```sql
-- 테이블 생성
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 사용자는 자신의 데이터만 조회 가능
CREATE POLICY "Users can view their own tasks"
ON tasks
FOR SELECT
TO authenticated
USING (auth.jwt()->>'sub' = user_id);

-- INSERT 정책: 사용자는 자신의 데이터만 삽입 가능
CREATE POLICY "Users can insert their own tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'sub' = user_id);

-- UPDATE 정책: 사용자는 자신의 데이터만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON tasks
FOR UPDATE
TO authenticated
USING (auth.jwt()->>'sub' = user_id)
WITH CHECK (auth.jwt()->>'sub' = user_id);

-- DELETE 정책: 사용자는 자신의 데이터만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON tasks
FOR DELETE
TO authenticated
USING (auth.jwt()->>'sub' = user_id);
```

### 개발 환경에서 RLS 비활성화

개발 초기 단계에서는 RLS를 비활성화하여 권한 관련 에러를 방지할 수 있습니다:

```sql
-- RLS 비활성화 (개발 환경 전용)
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

> **⚠️ 주의**: 프로덕션 환경에서는 반드시 RLS를 활성화하고 적절한 정책을 설정하세요!

## 통합 확인

통합이 제대로 설정되었는지 확인하려면:

1. **Clerk에서 로그인**
2. **Supabase 클라이언트로 데이터 조회**
3. **RLS 정책이 올바르게 작동하는지 확인**

예제 테스트 코드:

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function TestPage() {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) return;

    async function loadTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*');
      
      if (error) {
        console.error('Error:', error);
        return;
      }
      
      setTasks(data || []);
    }

    loadTasks();
  }, [user, supabase]);

  return (
    <div>
      <h1>Tasks for {user?.firstName}</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 문제 해결

### "Invalid JWT" 에러

- Clerk Dashboard에서 Supabase 통합이 활성화되었는지 확인
- Supabase Dashboard에서 Clerk 도메인이 올바르게 입력되었는지 확인
- 환경 변수가 올바르게 설정되었는지 확인

### RLS 정책이 작동하지 않음

- RLS가 활성화되었는지 확인: `SELECT * FROM pg_tables WHERE tablename = 'your_table';`
- 정책이 올바르게 생성되었는지 확인: `SELECT * FROM pg_policies WHERE tablename = 'your_table';`
- `auth.jwt()->>'sub'` 값이 Clerk 사용자 ID와 일치하는지 확인

### 토큰이 전달되지 않음

- Client Component에서는 `useClerkSupabaseClient()` 훅 사용 확인
- Server Component에서는 `createClerkSupabaseClient()` 함수 사용 확인
- `accessToken` 함수가 올바르게 구현되었는지 확인

## 참고 자료

- [Clerk 공식 Supabase 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase Third-Party Auth 문서](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Supabase Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

## 프로젝트 구조

이 프로젝트의 Supabase 클라이언트 파일 구조:

```
lib/supabase/
├── clerk-client.ts    # Client Component용 (useClerkSupabaseClient hook)
├── server.ts          # Server Component/Server Action용 (createClerkSupabaseClient)
├── service-role.ts    # 관리자 권한 작업용 (RLS 우회)
└── client.ts          # 인증 불필요한 공개 데이터용
```

각 파일의 용도와 사용 방법은 해당 파일의 주석을 참고하세요.

