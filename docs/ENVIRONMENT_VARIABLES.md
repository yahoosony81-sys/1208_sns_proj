# 환경 변수 설정 가이드

이 문서는 프로젝트에 필요한 모든 환경 변수에 대한 설명과 설정 방법을 제공합니다.

## 필수 환경 변수

### Clerk 인증 관련

#### `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **설명**: Clerk의 공개 키 (Publishable Key)
- **설정 위치**: Clerk Dashboard → API Keys → Publishable Key
- **공개 여부**: 공개 가능 (NEXT_PUBLIC_ 접두사)
- **예시**: `pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### `CLERK_SECRET_KEY`
- **설명**: Clerk의 비밀 키 (Secret Key)
- **설정 위치**: Clerk Dashboard → API Keys → Secret Key
- **공개 여부**: 절대 공개 금지 (서버 사이드 전용)
- **예시**: `sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- **설명**: 로그인 페이지 경로
- **기본값**: `/sign-in`
- **변경 가능**: 필요 시 다른 경로로 변경 가능

#### `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- **설명**: 로그인 성공 후 리다이렉트할 기본 URL
- **기본값**: `/`
- **변경 가능**: 필요 시 다른 경로로 변경 가능

#### `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
- **설명**: 회원가입 성공 후 리다이렉트할 기본 URL
- **기본값**: `/`
- **변경 가능**: 필요 시 다른 경로로 변경 가능

### Supabase 관련

#### `NEXT_PUBLIC_SUPABASE_URL`
- **설명**: Supabase 프로젝트 URL
- **설정 위치**: Supabase Dashboard → Settings → API → Project URL
- **공개 여부**: 공개 가능 (NEXT_PUBLIC_ 접두사)
- **예시**: `https://xxxxxxxxxxxxx.supabase.co`

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **설명**: Supabase의 익명 공개 키 (Anon/Public Key)
- **설정 위치**: Supabase Dashboard → Settings → API → anon public key
- **공개 여부**: 공개 가능 (NEXT_PUBLIC_ 접두사)
- **예시**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### `SUPABASE_SERVICE_ROLE_KEY`
- **설명**: Supabase의 서비스 역할 키 (관리자 권한)
- **설정 위치**: Supabase Dashboard → Settings → API → service_role secret key
- **공개 여부**: 절대 공개 금지 (서버 사이드 전용, RLS 우회)
- **주의**: 이 키는 모든 Row Level Security를 우회하므로 절대 클라이언트에 노출되지 않도록 주의
- **예시**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### `NEXT_PUBLIC_STORAGE_BUCKET`
- **설명**: Supabase Storage 버킷 이름
- **기본값**: `uploads`
- **설정 위치**: Supabase Dashboard → Storage에서 생성한 버킷 이름
- **변경 가능**: 다른 버킷 이름 사용 시 변경

## 환경별 설정

### 개발 환경 (로컬)

`.env` 파일을 프로젝트 루트에 생성하고 위의 모든 환경 변수를 설정합니다.

```bash
cp .env.example .env
# .env 파일을 열어 실제 값으로 채우기
```

### 프로덕션 환경 (Vercel)

Vercel Dashboard에서 환경 변수를 설정합니다:

1. Vercel Dashboard → 프로젝트 선택
2. Settings → Environment Variables
3. 각 환경 변수를 추가:
   - **Key**: 환경 변수 이름
   - **Value**: 실제 값
   - **Environment**: Production, Preview, Development 중 선택

**중요**: 
- `NEXT_PUBLIC_` 접두사가 있는 변수는 모든 환경에 설정
- `CLERK_SECRET_KEY`와 `SUPABASE_SERVICE_ROLE_KEY`는 Production 환경에만 설정 권장

## 환경 변수 가져오기

### 클라이언트 사이드

`NEXT_PUBLIC_` 접두사가 있는 변수만 클라이언트에서 접근 가능:

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
```

### 서버 사이드

모든 환경 변수에 접근 가능:

```typescript
const clerkSecret = process.env.CLERK_SECRET_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

## 보안 주의사항

1. **절대 공개하지 말 것**:
   - `CLERK_SECRET_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Git에 커밋하지 말 것**:
   - `.env` 파일은 `.gitignore`에 포함되어 있어야 함
   - `.env.example`만 커밋 (실제 값 없이 변수명만)

3. **환경 변수 검증**:
   - 애플리케이션 시작 시 필수 환경 변수가 설정되어 있는지 확인
   - 누락된 경우 명확한 에러 메시지 표시

## 문제 해결

### 환경 변수가 적용되지 않는 경우

1. **서버 재시작**: Next.js 개발 서버를 재시작
2. **변수명 확인**: 오타나 대소문자 확인
3. **접두사 확인**: 클라이언트에서 사용하는 변수는 `NEXT_PUBLIC_` 접두사 필요
4. **캐시 삭제**: `.next` 폴더 삭제 후 재빌드

### Vercel 배포 시 환경 변수 설정

1. Vercel Dashboard → 프로젝트 → Settings → Environment Variables
2. 각 환경 변수를 추가
3. 배포 재시작 (자동으로 재배포됨)

## 참고 자료

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Clerk Environment Variables](https://clerk.com/docs/quickstarts/nextjs)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)

