# 📝 게시물 작성 기능 개발 계획

## 개요

PRD.md와 TODO.md의 "## 5. 게시물 작성" 섹션을 기반으로 한 상세 개발 계획입니다.

## 목표

- Sidebar의 "만들기" 버튼 클릭 시 게시물 작성 모달 열기
- 이미지 업로드 (최대 5MB, jpeg/png/webp)
- 캡션 입력 (최대 2,200자)
- Supabase Storage에 이미지 저장
- posts 테이블에 게시물 데이터 저장
- 업로드 후 홈 피드에 자동 반영

---

## 개발 단계

### 1단계: CreatePostModal 컴포넌트 생성

#### 1-1. 기본 구조
- **파일**: `components/post/CreatePostModal.tsx`
- **기능**:
  - shadcn/ui Dialog 컴포넌트 사용
  - 모달 열기/닫기 상태 관리
  - Instagram 스타일 디자인 적용

#### 1-2. 이미지 선택 및 미리보기
- **기능**:
  - 파일 입력 필드 (hidden input + 커스텀 버튼)
  - 이미지 파일만 허용 (accept="image/jpeg,image/png,image/webp")
  - 선택한 이미지 미리보기 (1:1 정사각형 비율)
  - 이미지 제거 버튼
  - 파일 크기 검증 (최대 5MB)

#### 1-3. 캡션 입력 필드
- **기능**:
  - 텍스트 영역 (textarea)
  - 최대 2,200자 제한
  - 글자 수 카운터 표시
  - 플레이스홀더: "캡션을 입력하세요..."

#### 1-4. 업로드 버튼 및 상태 관리
- **기능**:
  - "게시" 버튼 (이미지 선택 필수)
  - 로딩 상태 표시 (업로드 중)
  - 에러 메시지 표시
  - 성공 시 모달 닫기 및 피드 새로고침

---

### 2단계: API 라우트 구현 (POST /api/posts)

#### 2-1. 기본 구조
- **파일**: `app/api/posts/route.ts` (기존 GET 메서드에 POST 추가)
- **기능**:
  - Clerk 인증 검증
  - FormData 파싱 (이미지 파일 + 캡션)

#### 2-2. 이미지 파일 검증
- **검증 항목**:
  - 파일 존재 여부
  - 파일 크기 (최대 5MB = 5,242,880 bytes)
  - MIME 타입 (image/jpeg, image/png, image/webp)
  - 파일 확장자 검증

#### 2-3. Supabase Storage 업로드
- **기능**:
  - 버킷: `posts`
  - 파일 경로: `{clerk_user_id}/{timestamp}-{random}.{ext}`
  - 예시: `user_123abc/1703123456789-abc123.jpg`
  - 공개 읽기 URL 생성

#### 2-4. posts 테이블에 데이터 저장
- **저장 데이터**:
  - `user_id`: Clerk user ID로 users 테이블에서 조회한 UUID
  - `image_url`: Supabase Storage 공개 URL
  - `caption`: 사용자 입력 캡션 (null 허용)
  - `created_at`, `updated_at`: 자동 생성

#### 2-5. 에러 처리
- **처리 항목**:
  - 인증 실패 (401)
  - 파일 검증 실패 (400)
  - Storage 업로드 실패 (500)
  - 데이터베이스 저장 실패 (500)

---

### 3단계: Sidebar "만들기" 버튼 연결

#### 3-1. Sidebar 컴포넌트 수정
- **파일**: `components/layout/Sidebar.tsx`
- **변경 사항**:
  - "만들기" 메뉴 항목을 Link에서 버튼으로 변경
  - 클릭 시 CreatePostModal 열기
  - 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트

#### 3-2. 모달 상태 관리
- **방법**:
  - CreatePostModal을 Sidebar에 통합
  - 또는 전역 상태 관리 (Context API)
  - 또는 CreatePostModal을 루트 레이아웃에 배치

---

### 4단계: 업로드 후 피드 새로고침

#### 4-1. PostFeed 컴포넌트 수정
- **파일**: `components/post/PostFeed.tsx`
- **기능**:
  - 게시물 업로드 성공 시 피드 새로고침
  - 또는 낙관적 업데이트 (새 게시물을 목록 맨 위에 추가)

#### 4-2. 상태 관리 방법
- **옵션 1**: Context API로 전역 상태 관리
- **옵션 2**: 이벤트 기반 (CustomEvent)
- **옵션 3**: React Query 사용 (추후 고려)

---

## 기술 스택 및 의존성

### 컴포넌트
- `@/components/ui/dialog`: shadcn/ui Dialog 컴포넌트
- `@/components/ui/button`: shadcn/ui Button 컴포넌트
- `@/components/ui/textarea`: shadcn/ui Textarea 컴포넌트

### 라이브러리
- `@clerk/nextjs`: 인증 (useUser, auth)
- `@supabase/supabase-js`: Storage 업로드
- `next/image`: 이미지 미리보기 (선택사항)

### API
- `POST /api/posts`: 게시물 생성
- Supabase Storage API: 이미지 업로드

---

## 파일 구조

```
components/
  post/
    CreatePostModal.tsx      # 게시물 작성 모달 (신규)
    PostCard.tsx              # 기존
    PostFeed.tsx              # 수정 (새로고침 기능 추가)

app/
  api/
    posts/
      route.ts                # 수정 (POST 메서드 추가)

components/
  layout/
    Sidebar.tsx               # 수정 (만들기 버튼 연결)
```

---

## 상세 구현 사항

### CreatePostModal.tsx 구조

```typescript
interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 상태 관리
- selectedFile: File | null
- previewUrl: string | null
- caption: string
- isUploading: boolean
- error: string | null

// 핸들러
- handleFileSelect: 파일 선택 및 미리보기
- handleFileRemove: 선택한 파일 제거
- handleCaptionChange: 캡션 입력
- handleSubmit: 게시물 업로드
```

### API Route (POST) 구조

```typescript
// 요청 형식
FormData {
  image: File
  caption?: string
}

// 응답 형식
{
  success: boolean
  post?: PostWithUser
  error?: string
}
```

### Storage 업로드 경로

```
posts/
  └── {clerk_user_id}/
      └── {timestamp}-{random}.{ext}
```

예시:
- `posts/user_2abc123/1703123456789-xyz789.jpg`
- `posts/user_2abc123/1703123456790-def456.png`

---

## 검증 규칙

### 이미지 파일
- ✅ 최대 크기: 5MB (5,242,880 bytes)
- ✅ 허용 형식: JPEG, PNG, WebP
- ✅ MIME 타입: `image/jpeg`, `image/png`, `image/webp`

### 캡션
- ✅ 최대 길이: 2,200자
- ✅ 선택 사항 (null 허용)
- ✅ 줄바꿈 허용

### 인증
- ✅ 로그인 필수 (Clerk)
- ✅ users 테이블에 존재하는 사용자만 업로드 가능

---

## 에러 처리

### 클라이언트 측
- 파일 크기 초과 → "파일 크기는 5MB 이하여야 합니다."
- 잘못된 파일 형식 → "JPEG, PNG, WebP 파일만 업로드 가능합니다."
- 네트워크 에러 → "네트워크 오류가 발생했습니다. 다시 시도해주세요."

### 서버 측
- 인증 실패 → 401 Unauthorized
- 파일 검증 실패 → 400 Bad Request
- Storage 업로드 실패 → 500 Internal Server Error
- 데이터베이스 저장 실패 → 500 Internal Server Error

---

## 테스트 시나리오

### 정상 케이스
1. ✅ 로그인 상태에서 "만들기" 클릭
2. ✅ 이미지 선택 (5MB 이하, JPEG/PNG/WebP)
3. ✅ 이미지 미리보기 표시
4. ✅ 캡션 입력 (선택사항)
5. ✅ "게시" 버튼 클릭
6. ✅ 업로드 성공 → 모달 닫기 → 피드에 새 게시물 표시

### 에러 케이스
1. ✅ 로그인하지 않은 상태 → 로그인 페이지로 리다이렉트
2. ✅ 파일 크기 초과 → 에러 메시지 표시
3. ✅ 잘못된 파일 형식 → 에러 메시지 표시
4. ✅ 네트워크 에러 → 에러 메시지 표시 및 재시도 가능

---

## 다음 단계 (완료 후)

1. 게시물 작성 완료 후 피드 새로고침
2. 업로드 진행률 표시 (선택사항)
3. 이미지 크롭 기능 (선택사항)
4. 여러 이미지 업로드 (2차 확장)

---

## 참고 자료

- [PRD.md](./PRD.md) - 프로젝트 요구사항
- [TODO.md](./TODO.md) - 개발 TODO 리스트
- [supabase/migrations/db.sql](../supabase/migrations/db.sql) - 데이터베이스 스키마
- [supabase/migrations/setup_posts_storage.sql](../supabase/migrations/setup_posts_storage.sql) - Storage 설정

---

## 개발 순서 권장사항

1. **CreatePostModal 기본 구조** (Dialog, 상태 관리)
2. **이미지 선택 및 미리보기** (파일 입력, 미리보기 UI)
3. **캡션 입력 필드** (Textarea, 글자 수 카운터)
4. **API 라우트 구현** (POST /api/posts)
5. **Sidebar 연결** (만들기 버튼 클릭 시 모달 열기)
6. **에러 처리 및 검증** (파일 검증, 에러 메시지)
7. **피드 새로고침** (업로드 후 자동 반영)

---

## 예상 소요 시간

- CreatePostModal 컴포넌트: 2-3시간
- API 라우트 구현: 1-2시간
- Sidebar 연결 및 통합: 30분
- 에러 처리 및 테스트: 1시간
- **총 예상 시간: 4-6시간**

