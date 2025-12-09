- [ ] `.cursor/` 디렉토리
  - [ ] `rules/` 커서룰
  - [ ] `mcp.json` MCP 서버 설정
  - [ ] `dir.md` 프로젝트 디렉토리 구조
- [ ] `.github/` 디렉토리
- [ ] `.husky/` 디렉토리
- [ ] `app/` 디렉토리
  - [ ] `favicon.ico` 파일
  - [ ] `not-found.tsx` 파일
  - [ ] `robots.ts` 파일
  - [ ] `sitemap.ts` 파일
  - [ ] `manifest.ts` 파일
- [ ] `supabase/` 디렉토리
- [ ] `public/` 디렉토리
  - [ ] `icons/` 디렉토리
  - [ ] `logo.png` 파일
  - [ ] `og-image.png` 파일
- [ ] `tsconfig.json` 파일
- [ ] `.cursorignore` 파일
- [ ] `.gitignore` 파일
- [ ] `.prettierignore` 파일
- [ ] `.prettierrc` 파일
- [ ] `tsconfig.json` 파일
- [ ] `eslint.config.mjs` 파일
- [ ] `AGENTS.md` 파일


# 📋 Mini Instagram - 개발 TODO 리스트

## 1. 기본 세팅

- [x] Tailwind CSS 설정 (인스타 컬러 스키마)
  - [x] `app/globals.css`에 Instagram 컬러 변수 추가
  - [x] 타이포그래피 설정
- [x] Supabase 데이터베이스 마이그레이션 파일 준비
  - [x] `db.sql` 파일 생성 완료 (모든 테이블, 뷰, 트리거 포함)
  - [x] `verify_database.sql` 검증 스크립트 생성 완료
  - [x] 검증 가이드 문서 생성 완료 (`docs/VERIFY_DATABASE.md`)
  - [x] 마이그레이션 적용 가이드 생성 완료 (`docs/MIGRATION_APPLY_GUIDE.md`)
  - [ ] `db.sql` 파일을 Supabase에 적용 (수동 작업 필요)
    - 📖 [적용 가이드](./MIGRATION_APPLY_GUIDE.md) 참고
  - [ ] 테이블 생성 확인 (users, posts, likes, comments, follows) - 검증 스크립트 사용
    - `verify_database.sql` 실행하여 자동 검증
  - [ ] Views 및 Triggers 확인 - 검증 스크립트 사용
    - `verify_database.sql` 실행하여 자동 검증
  - 📖 [마이그레이션 가이드](./setup-migration-guide.md) 참고
  - 📖 [검증 가이드](./VERIFY_DATABASE.md) 참고
- [x] Supabase Storage 버킷 설정 파일 준비
  - [x] `setup_posts_storage.sql` 파일 생성 완료 (정책 중복 방지 포함)
  - [x] 업로드 정책 설정 완료 (SELECT, INSERT, DELETE, UPDATE 정책 5개)
  - [x] 검증 쿼리 포함
  - [ ] `posts` 버킷 생성 (공개 읽기) - Supabase Dashboard에서 적용 필요
  - 📖 [마이그레이션 가이드](./setup-migration-guide.md) 참고
- [x] TypeScript 타입 정의
  - [x] `lib/types.ts` 파일 생성
  - [x] User, Post, Like, Comment, Follow 타입 정의

## 2. 레이아웃 구조

- [x] `app/(main)/layout.tsx` 생성
  - [x] Sidebar 통합
  - [x] 반응형 레이아웃 (Desktop/Tablet/Mobile)
  - [x] Main Content 영역 설정 (최대 630px, 중앙 정렬)
- [x] `components/layout/Sidebar.tsx`
  - [x] Desktop: 244px 너비, 아이콘 + 텍스트
  - [x] Tablet: 72px 너비, 아이콘만
  - [x] Mobile: 숨김
  - [x] 메뉴 항목: 홈, 검색, 만들기, 프로필
  - [x] Hover 효과 및 Active 상태 스타일
  - [x] Clerk 인증 상태에 따른 메뉴 표시
- [x] `components/layout/Header.tsx`
  - [x] Mobile 전용 (60px 높이)
  - [x] 로고 + 알림/DM/프로필 아이콘
  - [x] Clerk 인증 상태에 따른 아이콘 표시
- [x] `components/layout/BottomNav.tsx`
  - [x] Mobile 전용 (50px 높이)
  - [x] 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
  - [x] Active 상태 스타일
  - [x] Clerk 인증 상태에 따른 메뉴 표시

## 3. 홈 피드 페이지

- [x] `app/(main)/page.tsx` 생성
  - [x] PostFeed 컴포넌트 통합
  - [x] 배경색 #FAFAFA 설정 (layout.tsx의 bg-instagram-background)
- [x] `components/post/PostCard.tsx`
  - [x] 헤더 (프로필 이미지 32px, 사용자명, 시간, ⋯ 메뉴)
  - [x] 이미지 영역 (1:1 정사각형)
  - [x] 액션 버튼 (좋아요, 댓글, 공유, 북마크)
  - [x] 좋아요 수 표시
  - [x] 캡션 (사용자명 Bold + 내용, 2줄 초과 시 "... 더 보기")
  - [x] 댓글 미리보기 (최신 2개 표시)
  - [x] 더블탭 좋아요 기능 (모바일, 큰 하트 fade in/out)
  - [x] 좋아요 버튼 클릭 애니메이션 (scale 1.3 → 1, 0.15초)
  - [x] 좋아요 API 연동 (실제 좋아요 추가/제거)
- [x] `components/post/PostCardSkeleton.tsx`
  - [x] 로딩 UI (Skeleton + Shimmer 효과)
- [x] `components/post/PostFeed.tsx`
  - [x] 게시물 목록 렌더링
  - [x] 무한 스크롤 (Intersection Observer)
  - [x] 페이지네이션 (10개씩)
  - [x] 에러 처리 및 로딩 상태 관리
- [x] `app/api/posts/route.ts`
  - [x] GET: 게시물 목록 조회 (시간 역순 정렬)
  - [x] 페이지네이션 지원 (limit, offset)
  - [x] userId 파라미터 지원 (프로필 페이지용)
  - [x] 사용자 정보 및 통계 포함 (좋아요 수, 댓글 수, 좋아요 상태)
  - [x] 최신 댓글 2개 포함 (preview_comments)

## 4. 좋아요 기능

- [x] `app/api/likes/route.ts`
  - [x] POST: 좋아요 추가
  - [x] DELETE: 좋아요 제거
  - [x] 인증 검증 (Clerk)
  - [x] 중복 좋아요 방지
- [x] PostCard에 좋아요 기능 통합
  - [x] 빈 하트 ↔ 빨간 하트 상태 관리
  - [x] 클릭 애니메이션 (scale 1.3 → 1, 0.15초)
  - [x] 더블탭 좋아요 (모바일, 큰 하트 fade in/out)
  - [x] 좋아요 상태 표시
  - [x] 좋아요 수 실시간 업데이트
  - [x] 낙관적 업데이트 (Optimistic Update)

## 5. 게시물 작성

📖 [상세 개발 계획](./PLAN_POST_CREATE.md) 참고

- [x] `components/post/CreatePostModal.tsx`
  - [x] Dialog 컴포넌트 사용
  - [x] 이미지 미리보기 UI (1:1 정사각형)
  - [x] 텍스트 입력 필드 (최대 2,200자)
  - [x] 파일 선택 버튼
  - [x] 업로드 버튼
  - [x] 파일 크기 검증 (최대 5MB)
  - [x] 파일 형식 검증 (JPEG, PNG, WebP)
  - [x] 글자 수 카운터
  - [x] 로딩 상태 표시
  - [x] 에러 메시지 표시
  - [x] 이미지 제거 기능
- [x] `app/api/posts/route.ts`
  - [x] POST: 게시물 생성
  - [x] 이미지 파일 검증 (최대 5MB)
  - [x] MIME 타입 검증 (image/jpeg, image/png, image/webp)
  - [x] Supabase Storage 업로드 (posts 버킷)
  - [x] 파일 경로: `{clerk_user_id}/{timestamp}-{random}.{ext}`
  - [x] posts 테이블에 데이터 저장
  - [x] 인증 검증 (Clerk)
  - [x] 에러 처리 (401, 400, 500)
  - [x] 업로드 실패 시 파일 자동 삭제
- [x] Sidebar "만들기" 버튼 연결
  - [x] CreatePostModal 열기
  - [x] 로그인하지 않은 사용자 → 로그인 페이지 리다이렉트
  - [x] Desktop/Tablet/Mobile 모두 지원
- [x] BottomNav "만들기" 버튼 연결
  - [x] CreatePostModal 열기
  - [x] 로그인하지 않은 사용자 → 로그인 페이지 리다이렉트
- [x] 업로드 후 피드 새로고침
  - [x] 업로드 성공 시 페이지 새로고침 또는 홈으로 이동
  - [x] 모달 자동 닫기 및 상태 초기화

## 6. 댓글 기능

- [x] `components/comment/CommentList.tsx`
  - [x] 댓글 목록 렌더링
  - [x] PostCard: 최신 2개만 표시 (preview_comments 사용)
  - [x] 상세 모달: 전체 댓글 + 스크롤 (추후 구현)
  - [x] 삭제 버튼 (본인만 표시)
  - [x] 사용자명 클릭 시 프로필 페이지로 이동
  - [x] 시간 표시 (상대적 시간)
- [x] `components/comment/CommentForm.tsx`
  - [x] 댓글 입력 필드 ("댓글 달기...")
  - [x] Enter 키 또는 "게시" 버튼으로 제출
  - [x] Shift+Enter는 줄바꿈 처리
  - [x] 로그인하지 않은 사용자 처리
  - [x] 로딩 상태 표시
  - [x] 에러 메시지 표시
- [x] `app/api/comments/route.ts`
  - [x] POST: 댓글 작성
  - [x] DELETE: 댓글 삭제 (본인만)
  - [x] 인증 검증 (Clerk)
  - [x] 댓글 내용 검증 (빈 문자열 제외)
  - [x] 에러 처리 (401, 400, 403, 404, 500)
- [x] PostCard에 댓글 기능 통합
  - [x] CommentList 통합 (댓글 미리보기)
  - [x] CommentForm 통합 (댓글 입력)
  - [x] 댓글 작성 후 낙관적 업데이트 (comments_count 증가, preview_comments 업데이트)
  - [x] 댓글 삭제 후 낙관적 업데이트 (comments_count 감소, preview_comments에서 제거)

## 7. 게시물 상세 모달

- [x] `app/api/posts/[postId]/route.ts`
  - [x] GET: 단일 게시물 상세 정보 조회
  - [x] 게시물 정보, 통계, 전체 댓글 목록 반환
- [x] `components/post/PostModal.tsx`
  - [x] Desktop: 모달 형식 (이미지 50% + 댓글 50%)
  - [x] Mobile: 전체 페이지로 전환
  - [x] 닫기 버튼 (✕)
  - [x] 이전/다음 게시물 네비게이션 (Desktop)
  - [x] 좋아요 기능 (PostCard와 동일한 로직)
  - [x] 댓글 전체 목록 표시 (CommentList 재사용)
  - [x] 댓글 작성/삭제 (CommentForm 재사용)
  - [x] 로딩 상태 (Skeleton UI)
  - [x] 에러 처리
  - [x] 키보드 지원 (ESC, ← → 화살표)
- [x] PostCard 클릭 시 PostModal 열기
  - [x] 이미지 클릭 시 모달 열기 (더블탭 좋아요 유지)
  - [x] 댓글 아이콘 클릭 시 모달 열기
  - [x] "댓글 모두 보기" 링크 클릭 시 모달 열기
  - [x] 게시물 상세 정보 로드
  - [x] 댓글 전체 목록 표시
- [x] PostFeed 수정
  - [x] feedPosts를 PostCard에 전달 (이전/다음 게시물 네비게이션용)

## 8. 프로필 페이지

- [x] `app/(main)/profile/[userId]/page.tsx`
  - [x] 동적 라우트 생성
  - [x] ProfileHeader 통합
  - [x] PostGrid 통합
  - [x] Server Component로 데이터 페칭
  - [x] 에러 처리 (notFound)
- [x] `app/(main)/profile/page.tsx`
  - [x] 본인 프로필 리다이렉트 페이지
  - [x] Clerk 사용자 ID 조회 후 `/profile/[userId]`로 리다이렉트
- [x] `components/profile/ProfileHeader.tsx`
  - [x] 프로필 이미지 (150px Desktop / 90px Mobile)
  - [x] 사용자명
  - [x] 통계 (게시물 수, 팔로워 수, 팔로잉 수)
  - [x] "팔로우" / "팔로잉" 버튼 (다른 사람 프로필, UI만)
  - [x] "프로필 편집" 버튼 (본인 프로필, UI만)
  - [x] Desktop/Mobile 반응형 레이아웃
- [x] `components/profile/PostGrid.tsx`
  - [x] 3열 그리드 레이아웃 (반응형: Desktop 3열, Tablet 2열, Mobile 1열)
  - [x] 1:1 정사각형 썸네일
  - [x] Hover 시 좋아요/댓글 수 표시
  - [x] 클릭 시 게시물 상세 모달 열기 (PostModal 재사용)
  - [x] 게시물 없을 때 빈 상태 UI
- [x] `app/api/users/[userId]/route.ts`
  - [x] GET: 사용자 정보 조회
  - [x] user_stats 뷰 활용
  - [x] 팔로우 관계 확인
  - [x] 본인 프로필 여부 확인
- [x] Sidebar/BottomNav "프로필" 버튼 연결
  - [x] `/profile`로 리다이렉트 (본인 프로필)
  - [x] `/profile` 페이지에서 자동으로 `/profile/[userId]`로 리다이렉트
- [x] 로딩 상태 및 에러 처리
  - [x] `app/(main)/profile/[userId]/loading.tsx` 생성 (Skeleton UI)
  - [x] `app/not-found.tsx` 생성 (커스텀 404 페이지)
  - [x] 사용자 없음 에러 처리

## 9. 팔로우 기능

- [x] `app/api/follows/route.ts`
  - [x] POST: 팔로우 추가
  - [x] DELETE: 팔로우 제거
  - [x] 인증 검증 (Clerk)
  - [x] 자기 자신 팔로우 방지
- [x] `components/profile/FollowButton.tsx`
  - [x] "팔로우" 버튼 (파란색, 미팔로우 상태)
  - [x] "팔로잉" 버튼 (회색, 팔로우 중 상태)
  - [x] Hover 시 "언팔로우" (빨간 테두리)
  - [x] 클릭 시 즉시 API 호출 및 UI 업데이트
- [x] ProfileHeader에 FollowButton 통합
  - [x] 팔로우 상태 관리
  - [x] 통계 실시간 업데이트

## 10. 게시물 삭제

- [x] `app/api/posts/[postId]/route.ts`
  - [x] DELETE: 게시물 삭제
  - [x] 본인만 삭제 가능 (인증 검증)
  - [x] Supabase Storage에서 이미지 삭제
- [x] PostCard ⋯ 메뉴
  - [x] 본인 게시물만 삭제 옵션 표시
  - [x] 삭제 확인 다이얼로그
  - [x] 삭제 후 피드에서 제거

## 11. 반응형 및 애니메이션

- [ ] 반응형 브레이크포인트 적용
  - [ ] Mobile (< 768px): BottomNav, Header 표시
  - [ ] Tablet (768px ~ 1023px): Icon-only Sidebar
  - [ ] Desktop (1024px+): Full Sidebar
- [ ] 좋아요 애니메이션
  - [ ] 클릭 시 scale(1.3) → scale(1) (0.15초)
  - [ ] 더블탭 시 큰 하트 fade in/out (1초)
- [ ] 로딩 상태
  - [ ] Skeleton UI (PostCardSkeleton)
  - [ ] Shimmer 효과

## 12. 에러 핸들링 및 최적화

- [ ] 에러 핸들링
  - [ ] API 에러 처리
  - [ ] 사용자 친화적 에러 메시지
  - [ ] 네트워크 에러 처리
- [ ] 이미지 최적화
  - [ ] Next.js Image 컴포넌트 사용
  - [ ] Lazy loading
- [ ] 성능 최적화
  - [ ] React.memo 적용 (필요한 컴포넌트)
  - [ ] useMemo, useCallback 활용

## 13. 최종 마무리

- [ ] 모바일/태블릿 반응형 테스트
  - [ ] 다양한 화면 크기에서 테스트
  - [ ] 터치 인터랙션 테스트
- [ ] 접근성 검토
  - [ ] 키보드 네비게이션
  - [ ] ARIA 레이블
- [ ] 코드 정리
  - [ ] 불필요한 주석 제거
  - [ ] 코드 포맷팅
- [ ] 배포 준비
  - [ ] 환경 변수 설정
  - [ ] Vercel 배포 설정
  - [ ] 프로덕션 빌드 테스트
