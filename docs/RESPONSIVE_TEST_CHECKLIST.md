# 반응형 테스트 체크리스트

이 문서는 Mini Instagram 프로젝트의 반응형 디자인 테스트를 위한 체크리스트입니다.

## 브레이크포인트

- **Mobile**: < 768px
- **Tablet**: 768px ~ 1023px
- **Desktop**: 1024px+

## 1. 레이아웃 컴포넌트 테스트

### 1.1 Sidebar (`components/layout/Sidebar.tsx`)

#### Desktop (1024px+)
- [ ] Sidebar 너비: 244px
- [ ] 아이콘 + 텍스트 표시
- [ ] 로고 "Instagram" 표시
- [ ] 네비게이션 메뉴: 홈, 검색, 만들기, 프로필
- [ ] Active 상태: 볼드 + 두꺼운 stroke
- [ ] Hover 효과 작동

#### Tablet (768px ~ 1023px)
- [ ] Sidebar 너비: 72px
- [ ] 아이콘만 표시 (텍스트 숨김)
- [ ] 로고 숨김 또는 아이콘으로 대체
- [ ] 네비게이션 메뉴 아이콘만 표시
- [ ] Active 상태 시각적 표시

#### Mobile (< 768px)
- [ ] Sidebar 완전히 숨김 (`hidden md:flex`)

### 1.2 Header (`components/layout/Header.tsx`)

#### Mobile (< 768px)
- [ ] Header 높이: 60px
- [ ] 로고 "Instagram" 표시
- [ ] 우측 아이콘: 활동, 메시지, 프로필
- [ ] 고정 위치 (sticky/fixed)
- [ ] 배경색: 흰색

#### Tablet/Desktop (768px+)
- [ ] Header 숨김 (`md:hidden`)

### 1.3 BottomNav (`components/layout/BottomNav.tsx`)

#### Mobile (< 768px)
- [ ] BottomNav 높이: 50px
- [ ] 하단 고정 위치
- [ ] 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
- [ ] Active 상태 시각적 표시
- [ ] 터치 영역 최소 44px

#### Tablet/Desktop (768px+)
- [ ] BottomNav 숨김 (`md:hidden`)

### 1.4 Main Layout (`app/(main)/layout.tsx`)

#### Desktop (1024px+)
- [ ] Main Content 왼쪽 패딩: 244px (Sidebar 너비)
- [ ] 최대 너비: 630px, 중앙 정렬
- [ ] 배경색: #FAFAFA

#### Tablet (768px ~ 1023px)
- [ ] Main Content 왼쪽 패딩: 72px (Icon-only Sidebar 너비)
- [ ] 최대 너비: 630px, 중앙 정렬
- [ ] 배경색: #FAFAFA

#### Mobile (< 768px)
- [ ] Main Content 상단 패딩: 60px (Header 높이)
- [ ] Main Content 하단 패딩: 50px (BottomNav 높이)
- [ ] 전체 너비 사용
- [ ] 배경색: #FAFAFA

## 2. 페이지별 반응형 테스트

### 2.1 홈 피드 (`app/(main)/page.tsx`)

#### 모든 화면 크기
- [ ] PostCard가 올바르게 표시됨
- [ ] 무한 스크롤 작동
- [ ] 로딩 스켈레톤 표시

#### Desktop/Tablet
- [ ] PostCard 최대 너비: 630px
- [ ] 중앙 정렬

#### Mobile
- [ ] PostCard 전체 너비
- [ ] 좌우 패딩 적절

### 2.2 프로필 페이지 (`app/(main)/profile/[userId]/page.tsx`)

#### Desktop (1024px+)
- [ ] ProfileHeader 가로 레이아웃
- [ ] 프로필 이미지: 150px
- [ ] 통계 가로 배치
- [ ] PostGrid 3열 그리드

#### Tablet (768px ~ 1023px)
- [ ] ProfileHeader 가로 레이아웃
- [ ] 프로필 이미지: 150px
- [ ] PostGrid 2열 그리드

#### Mobile (< 768px)
- [ ] ProfileHeader 세로 레이아웃
- [ ] 프로필 이미지: 90px
- [ ] 통계 세로 배치
- [ ] PostGrid 1열 그리드

### 2.3 게시물 상세 모달 (`components/post/PostModal.tsx`)

#### Desktop (1024px+)
- [ ] 모달 형식 (Dialog)
- [ ] 이미지 50% + 댓글 50% 레이아웃
- [ ] 이전/다음 게시물 네비게이션 버튼 표시
- [ ] 닫기 버튼 (✕) 표시

#### Mobile (< 768px)
- [ ] 전체 페이지 형식
- [ ] 이미지 전체 너비
- [ ] 댓글 영역 하단 배치
- [ ] 이전/다음 게시물 네비게이션 숨김
- [ ] 뒤로가기 버튼 표시

## 3. 컴포넌트별 반응형 테스트

### 3.1 PostCard (`components/post/PostCard.tsx`)

#### 모든 화면 크기
- [ ] 헤더: 프로필 이미지 32px, 사용자명, 시간, 메뉴
- [ ] 이미지: 1:1 정사각형 (aspect-square)
- [ ] 액션 버튼: 좋아요, 댓글, 공유, 북마크
- [ ] 좋아요 수 표시
- [ ] 캡션 표시 (2줄 초과 시 "... 더 보기")
- [ ] 댓글 미리보기 (최신 2개)

#### Desktop/Tablet
- [ ] 최대 너비: 630px
- [ ] 중앙 정렬

#### Mobile
- [ ] 전체 너비
- [ ] 더블탭 좋아요 작동

### 3.2 PostGrid (`components/profile/PostGrid.tsx`)

#### Desktop (1024px+)
- [ ] 3열 그리드 (`lg:grid-cols-3`)
- [ ] 1:1 정사각형 썸네일
- [ ] Hover 시 좋아요/댓글 수 표시

#### Tablet (768px ~ 1023px)
- [ ] 2열 그리드 (`sm:grid-cols-2`)
- [ ] 1:1 정사각형 썸네일

#### Mobile (< 768px)
- [ ] 1열 그리드 (`grid-cols-1`)
- [ ] 1:1 정사각형 썸네일

### 3.3 ProfileHeader (`components/profile/ProfileHeader.tsx`)

#### Desktop (1024px+)
- [ ] 가로 레이아웃
- [ ] 프로필 이미지: 150px
- [ ] 통계 가로 배치 (게시물, 팔로워, 팔로잉)
- [ ] 버튼: "프로필 편집" 또는 "팔로우"/"팔로잉"

#### Mobile (< 768px)
- [ ] 세로 레이아웃
- [ ] 프로필 이미지: 90px
- [ ] 통계 세로 배치
- [ ] 버튼 전체 너비

## 4. 터치 인터랙션 테스트

### 4.1 터치 영역 크기

#### 최소 크기: 44px × 44px (iOS/Android 권장)

- [ ] BottomNav 네비게이션 버튼
- [ ] PostCard 좋아요 버튼
- [ ] PostCard 댓글 버튼
- [ ] PostCard 메뉴 버튼 (⋯)
- [ ] ProfileHeader 팔로우 버튼
- [ ] CreatePostModal 업로드 버튼
- [ ] CommentForm 게시 버튼

### 4.2 터치 제스처

- [ ] 더블탭 좋아요 (PostCard 이미지)
  - [ ] 첫 번째 탭: 모달 열기 대기
  - [ ] 300ms 내 두 번째 탭: 좋아요 토글
  - [ ] 큰 하트 애니메이션 표시
- [ ] 스크롤 성능
  - [ ] 무한 스크롤 부드럽게 작동
  - [ ] 스크롤 중 프레임 드롭 없음
- [ ] 스와이프 제스처 (필요 시)
  - [ ] PostModal에서 이미지 스와이프 (선택적)

### 4.3 모바일 브라우저 호환성

#### iOS Safari
- [ ] 레이아웃 정상 표시
- [ ] 터치 인터랙션 작동
- [ ] 스크롤 부드러움
- [ ] 고정 요소 (Header, BottomNav) 정상 작동

#### Android Chrome
- [ ] 레이아웃 정상 표시
- [ ] 터치 인터랙션 작동
- [ ] 스크롤 부드러움
- [ ] 고정 요소 정상 작동

## 5. 뷰포트 메타 태그 확인

### 5.1 메타 태그 설정

`app/layout.tsx`에 다음 메타 태그가 설정되어 있는지 확인:

```tsx
export const metadata: Metadata = {
  // ...
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};
```

또는 Next.js가 자동으로 추가하는지 확인 (Next.js 13+는 자동 추가)

## 6. 테스트 방법

### 6.1 개발자 도구 사용

1. Chrome DevTools 열기 (F12)
2. Device Toolbar 활성화 (Ctrl+Shift+M)
3. 다음 디바이스로 테스트:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Desktop (1280px+)

### 6.2 실제 디바이스 테스트

- [ ] 실제 모바일 디바이스에서 테스트
- [ ] 실제 태블릿 디바이스에서 테스트
- [ ] 다양한 브라우저에서 테스트

## 7. 발견된 이슈 기록

테스트 중 발견된 반응형 관련 이슈를 아래에 기록하세요:

### 이슈 1: [제목]
- **화면 크기**: 
- **브라우저**: 
- **설명**: 
- **해결 방법**: 

---

**참고**: 이 체크리스트는 PRD.md의 반응형 요구사항을 기반으로 작성되었습니다.

