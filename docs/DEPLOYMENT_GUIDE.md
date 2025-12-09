# 배포 가이드

이 문서는 Mini Instagram 프로젝트를 Vercel에 배포하는 방법을 안내합니다.

## 사전 준비

### 1. GitHub 저장소 준비

1. GitHub에 프로젝트 저장소 생성
2. 로컬 프로젝트를 GitHub에 푸시:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Supabase 프로젝트 준비

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 프로젝트 생성
2. 데이터베이스 마이그레이션 적용:
   - SQL Editor에서 `supabase/migrations/db.sql` 실행
3. Storage 버킷 생성:
   - Storage → New bucket → `uploads` 생성
   - Public 또는 Private 설정 (프로젝트 요구사항에 따라)
4. API 키 확인:
   - Settings → API에서 URL과 키 복사

### 3. Clerk 프로젝트 준비

1. [Clerk Dashboard](https://dashboard.clerk.com/)에서 프로젝트 생성
2. 인증 방식 설정 (Email, Google 등)
3. API 키 확인:
   - API Keys에서 Publishable Key와 Secret Key 복사

## Vercel 배포

### 1. Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. **Add New...** → **Project** 클릭
3. GitHub 저장소 선택 또는 Import
4. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `pnpm build` (또는 `npm run build`)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `pnpm install` (또는 `npm install`)

### 2. 환경 변수 설정

Vercel Dashboard → 프로젝트 → **Settings** → **Environment Variables**에서 다음 변수 추가:

#### Clerk 환경 변수
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-publishable-key>
CLERK_SECRET_KEY=<your-secret-key>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

#### Supabase 환경 변수
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

**중요**:
- 각 환경 변수를 **Production**, **Preview**, **Development** 환경에 설정
- `CLERK_SECRET_KEY`와 `SUPABASE_SERVICE_ROLE_KEY`는 Production에만 설정 권장

### 3. 배포 실행

1. **Deploy** 버튼 클릭
2. 배포 진행 상황 확인
3. 배포 완료 후 제공되는 URL 확인

### 4. 배포 후 확인

1. **도메인 설정** (선택사항):
   - Settings → Domains에서 커스텀 도메인 추가
2. **환경 변수 확인**:
   - 배포된 사이트에서 환경 변수가 올바르게 적용되었는지 확인
3. **기능 테스트**:
   - 로그인/회원가입
   - 게시물 작성
   - 이미지 업로드
   - 댓글 작성
   - 좋아요 기능

## 배포 체크리스트

배포 전 확인 사항:

- [ ] 모든 환경 변수가 설정되었는지 확인
- [ ] Supabase 데이터베이스 마이그레이션이 적용되었는지 확인
- [ ] Supabase Storage 버킷이 생성되었는지 확인
- [ ] Clerk 프로젝트가 올바르게 설정되었는지 확인
- [ ] 로컬에서 `pnpm build`가 성공하는지 확인
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인

배포 후 확인 사항:

- [ ] 사이트가 정상적으로 로드되는지 확인
- [ ] 로그인/회원가입이 작동하는지 확인
- [ ] 게시물 작성 및 이미지 업로드가 작동하는지 확인
- [ ] API 엔드포인트가 정상적으로 응답하는지 확인
- [ ] 에러가 발생하지 않는지 확인 (Vercel 로그 확인)

## 문제 해결

### 빌드 실패

1. **에러 로그 확인**: Vercel Dashboard → Deployments → 실패한 배포 → Logs
2. **일반적인 원인**:
   - 환경 변수 누락
   - 의존성 설치 실패
   - TypeScript 에러
   - 빌드 명령어 오류

### 환경 변수 문제

1. **변수명 확인**: 대소문자, 오타 확인
2. **접두사 확인**: 클라이언트 변수는 `NEXT_PUBLIC_` 필요
3. **환경 확인**: Production/Preview/Development 환경별로 설정 확인

### 런타임 에러

1. **Vercel 로그 확인**: Functions 탭에서 에러 로그 확인
2. **브라우저 콘솔 확인**: 클라이언트 사이드 에러 확인
3. **API 응답 확인**: Network 탭에서 API 요청/응답 확인

## 지속적 배포 (CI/CD)

Vercel은 GitHub와 연동하여 자동 배포를 지원합니다:

1. **자동 배포 설정**:
   - `main` 브랜치에 푸시 시 Production 배포
   - Pull Request 생성 시 Preview 배포

2. **배포 알림**:
   - Vercel Dashboard에서 배포 상태 확인
   - GitHub Actions와 연동 가능

## 성능 최적화

### 이미지 최적화

- Next.js Image 컴포넌트 사용 (이미 적용됨)
- Supabase Storage 도메인이 `next.config.ts`에 추가되어 있는지 확인

### 번들 크기 최적화

- 불필요한 의존성 제거
- Dynamic import 사용 (필요 시)

### 캐싱 설정

- Vercel은 자동으로 정적 자산 캐싱
- API Route는 적절한 Cache-Control 헤더 설정

## 모니터링

### Vercel Analytics

1. Vercel Dashboard → 프로젝트 → Analytics
2. 웹사이트 성능 지표 확인

### 에러 추적

- Vercel Logs에서 에러 확인
- 필요 시 Sentry 등 에러 추적 서비스 연동

## 추가 리소스

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

