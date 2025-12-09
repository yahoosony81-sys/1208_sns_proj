/**
 * @file page.tsx
 * @description 홈 피드 페이지
 *
 * Instagram 스타일 홈 피드:
 * - 배경색: #FAFAFA (layout.tsx의 bg-instagram-background로 설정됨)
 * - 게시물 카드 목록 표시
 *
 * @dependencies
 * - components/post/PostFeed: 게시물 피드 컴포넌트
 */

import PostFeed from '@/components/post/PostFeed';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="w-full">
      <PostFeed />
    </div>
  );
}

