# Supabase Next.js 퀵스타트 가이드

이 문서는 [Supabase 공식 Next.js 퀵스타트 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)를 기반으로 프로젝트에 Supabase를 연결하는 방법을 설명합니다.

## 개요

이 프로젝트는 Clerk 인증과 Supabase를 함께 사용하지만, Supabase 공식 가이드의 모범 사례를 따릅니다.

## 1단계: Supabase 프로젝트 생성

1. [database.new](https://database.new)에 접속하여 새 Supabase 프로젝트 생성
2. 또는 [Supabase Dashboard](https://supabase.com/dashboard)에서 프로젝트 생성

## 2단계: 환경 변수 설정

프로젝트 루트의 `.env` 파일에 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
# 또는 공식 가이드에 맞춰
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

> **참고**: 프로젝트는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`와 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 둘 다 지원합니다.

환경 변수는 Supabase Dashboard → **Settings** → **API**에서 확인할 수 있습니다.

## 3단계: 테이블 생성 및 샘플 데이터 삽입

### 방법 1: Supabase Dashboard 사용

1. Supabase Dashboard → **Table Editor**
2. **New Table** 클릭
3. 테이블 이름: `instruments`
4. 컬럼 추가:
   - `id`: `bigint`, Primary Key, Identity (자동 증가)
   - `name`: `text`, Not Null
5. **Save** 클릭
6. **Insert row**로 샘플 데이터 추가:
   - `violin`
   - `viola`
   - `cello`

### 방법 2: SQL Editor 사용

1. Supabase Dashboard → **SQL Editor**
2. **New query** 클릭
3. 다음 SQL 실행:

```sql
-- 테이블 생성
CREATE TABLE instruments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL
);

-- 샘플 데이터 삽입
INSERT INTO instruments (name)
VALUES
  ('violin'),
  ('viola'),
  ('cello');

-- RLS 활성화
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "public can read instruments"
ON instruments
FOR SELECT
TO anon
USING (true);
```

### 방법 3: 마이그레이션 파일 사용

프로젝트에 포함된 마이그레이션 파일을 사용할 수 있습니다:

```bash
# Supabase CLI를 사용하여 마이그레이션 적용
supabase db push
```

또는 Supabase Dashboard의 SQL Editor에서 `supabase/migrations/create_instruments_table.sql` 파일 내용을 실행하세요.

## 4단계: 데이터 조회 예제

프로젝트에는 공식 가이드에 맞춘 예제 페이지가 포함되어 있습니다:

### Server Component 예제

`app/instruments/page.tsx` 파일을 참고하세요:

```tsx
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments } = await supabase
    .from("instruments")
    .select();

  return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
}

export default function Instruments() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InstrumentsData />
    </Suspense>
  );
}
```

### 접속 방법

개발 서버를 실행한 후 다음 URL로 접속:

```
http://localhost:3000/instruments
```

## 5단계: Supabase 클라이언트 사용

프로젝트는 Supabase 공식 가이드에 맞춰 클라이언트를 구성했습니다:

### Server Component에서 사용

```tsx
import { createClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('table').select('*');
  return <div>...</div>;
}
```

### Client Component에서 사용 (Clerk 인증 포함)

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';

export default function MyComponent() {
  const supabase = useClerkSupabaseClient();
  // Clerk 인증이 자동으로 적용됨
  const { data } = await supabase.from('table').select('*');
  return <div>...</div>;
}
```

### 공개 데이터용 클라이언트

```tsx
'use client';

import { supabase } from '@/lib/supabase/client';

export default function PublicData() {
  const { data } = await supabase.from('public_table').select('*');
  return <div>...</div>;
}
```

## 프로젝트 구조

```
lib/supabase/
├── server.ts          # Server Component용 (공식 가이드 스타일)
├── clerk-client.ts    # Client Component용 (Clerk 인증 포함)
├── client.ts          # 공개 데이터용
└── service-role.ts    # 관리자 권한용
```

## Clerk 통합과의 차이점

이 프로젝트는 Clerk 인증을 사용하므로, Supabase의 기본 인증 대신 Clerk 토큰을 사용합니다:

- ✅ **Clerk 인증**: `lib/supabase/server.ts`와 `lib/supabase/clerk-client.ts`에서 Clerk 토큰 자동 적용
- ✅ **공식 가이드 호환**: `createClient()` 함수는 공식 가이드와 동일한 패턴
- ✅ **환경 변수 지원**: `PUBLISHABLE_KEY`와 `ANON_KEY` 둘 다 지원

## 다음 단계

- [Clerk + Supabase 통합 가이드](./clerk-supabase-integration.md) - Clerk와 Supabase 통합 방법
- [RLS 정책 예시](./rls-policies-examples.md) - Row Level Security 정책 작성
- [Supabase 공식 문서](https://supabase.com/docs) - 더 많은 기능과 예제

## 문제 해결

### "relation does not exist" 에러

- 테이블이 생성되었는지 확인
- Supabase Dashboard → Table Editor에서 테이블 확인
- 마이그레이션 파일이 실행되었는지 확인

### "permission denied" 에러

- RLS 정책이 올바르게 설정되었는지 확인
- 공개 데이터의 경우 `anon` 역할에 대한 정책 필요
- 인증된 데이터의 경우 `authenticated` 역할에 대한 정책 필요

### 환경 변수 에러

- `.env` 파일이 프로젝트 루트에 있는지 확인
- 환경 변수 이름이 정확한지 확인 (`NEXT_PUBLIC_` 접두사 필수)
- 개발 서버를 재시작

## 참고 자료

- [Supabase 공식 Next.js 퀵스타트](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase JavaScript 클라이언트 문서](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js App Router 문서](https://nextjs.org/docs/app)

